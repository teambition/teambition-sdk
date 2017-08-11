import 'rxjs/add/operator/publish'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/takeLast'
import 'rxjs/add/observable/merge'
import { Database } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable'
import { Subject } from 'rxjs/Subject'

import { forEach, ParsedWSMsg, createProxy, eventToRE, WSMsgToDBHandler } from '../utils'

export type Flags = {
  /**
   * 中间件默认获得原消息对象的拷贝，无需担心对所得消息的变动会
   * 影响其他中间件获取原消息内容。设置 mutate 为 true，则中间件
   * 直接获得原消息对象，对其的变动会影响后续中间件所得消息的内容。
   */
  mutate?: boolean
}

export type CustomMsgHandler = MsgHandler | MsgToDBHandler

export type MsgHandlerRemoval = () => void

export type Interceptor = (msg: ParsedWSMsg, ...args: any[]) => void | ControlFlow | Observable<any>

type InterceptorCreator = (handler: CustomMsgHandler) => Interceptor

class Sequence {

  private interceptors: Interceptor[] = []
  private sink: Interceptor | null = null

  append(handler: CustomMsgHandler, options: Flags = {}): MsgHandlerRemoval {
    const interceptor = createInterceptor(handler, options)
    this.interceptors.push(interceptor)
    return () => {
      this.remove(interceptor)
    }
  }

  remove(handler: Interceptor) {
    let iter = this.interceptors.length - 1
    while (iter >= 0) {
      if (handler === this.interceptors[iter]) {
        this.interceptors.splice(iter, 1)
        break
      }
      iter--
    }
  }

  apply: Interceptor = (msg, ...args) => {
    let cf: ControlFlow | Observable<any> = ControlFlow.PassThrough

    forEach(this.interceptors, (interceptor): void | false => {
      cf = interceptor(msg, ...args) || ControlFlow.PassThrough

      if (cf === ControlFlow.ShortCircuit || (cf as any) instanceof Observable) {
        return false
      }
    })

    if ((cf as any) instanceof Observable || !this.sink) {
      return cf
    }

    return this.sink(msg, ...args)
  }

  setSink(interceptor: Interceptor) {
    this.sink = interceptor
  }

}

export type MsgToDBHandler = (msg: ParsedWSMsg, db: Database) => void | ControlFlow | Observable<any>

/**
 * websocket 拦截器的序列。
 */
export class Interceptors {

  private seq: Sequence = new Sequence()

  /**
   * 若提供 destination，会设置默认的消息处理逻辑。当所有通过
   * append() 添加的拦截器都 pass-through，由 destination 处理
   * （可能经部分拦截器修改的）消息。
   */
  constructor(destination?: WSMsgToDBHandler) {
    if (destination) {
      this.seq.setSink(destination)
    }
  }

  /**
   * 往当前拦截器序列的尾端添加一个拦截器。
   */
  append(handler: MsgToDBHandler, options?: Flags) {
    return this.seq.append(handler, options)
  }

  /**
   * 传入 websocket 消息内容，及相关数据库信息，从头到尾执行序列中的拦截器。
   * 如果其中一个拦截器返回 ControlFlow.ShortCircuit，其后续的中间件将被跳过，不执行。
   * 如果一个拦截器返回 ControlFlow.IngoreDefaultDBOps，不仅跳过（不执行）后续拦截器，
   * 也会跳过本会对传入消息进行的默认数据库操作。
   */
  apply: MsgToDBHandler = (msg, db) => {
    return this.seq.apply(msg, db)
  }
}

interface Daemon {
  start$: Subject<any>,
  suspend$: Subject<any>,
  published$: ConnectableObservable<ParsedWSMsg>,
  connection: Subscription
}

export type MsgHandler = (msg: ParsedWSMsg) => void

/**
 * websocket 代理。
 * 使用 Proxy 来为与数据模型无关的推送消息进行相应处理。
 */
export class Proxy {

  private seq: Sequence = new Sequence()
  private publishedHandler: Map<string, Observable<ParsedWSMsg>> = new Map()
  private daemonManager: Map<string, Daemon> = new Map()

  /**
   * 注册一个代理。
   * 该代理将会获得原推送消息经解析后的消息对象。
   * 返回函数用于移除所注册的回调。
   */
  register(handler: MsgHandler): MsgHandlerRemoval {
    return this.seq.append(handler)
  }

  /**
   * 将一条推送消息广播给所有注册的代理。
   */
  apply: MsgHandler = (msg) => {
    this.seq.apply(msg)
  }

  /**
   * 根据 pattern（支持正则） 注册一个代理。
   * 该代理将会获得原推送消息经解析后的消息对象。
   * 返回函数用于移除所注册的回调。
   */
  on(pattern: string, handler: MsgHandler): MsgHandlerRemoval {
    const re = eventToRE(pattern)

    return this.register((msg: ParsedWSMsg) => {
      if (msg.source && re.test(msg.source)) {
        handler(msg)
      }
      re.lastIndex = 0
    })
  }

  /**
   * 根据某个 pattern 持续订阅某个 socket event, e.g. publish(':change:task/:id')
   * 以 socket type 开头 例如: change、new、remove、destroy、refresh
   */
  publish(pattern: string): Observable<ParsedWSMsg> {
    if (!this.publishedHandler.has(pattern)) {
      const source = this.createMsg$(pattern, () => {
        // 当订阅数降到 0 时，移除该条目
        this.publishedHandler.delete(pattern)
      })
      this.publishedHandler.set(pattern, source.publish().refCount())
    }
    return this.publishedHandler.get(pattern)!
  }

  /**
   * 获得 `e` 字段能匹配给定 pattern 的 refresh 推送的流，其中每一个值
   * 对应所得消息解析完成的完整消息内容。
   * @param pattern 要监听的 refresh 事件的格式，如 'tasks/123'
   * @param appNamespace 提供应用特有的 appNamespace 以避免受潜在的注册了同样 pattern
   */
  fromRefresh(pattern: string, appNamespace: string) {
    if (!/^:refresh:/.test(pattern)) {
      pattern  = `:refresh:${pattern}`
    }
    return Observable.create((observer: Observer<ParsedWSMsg>) => {
      return this.onRefreshEvent(pattern, appNamespace, (msg) => observer.next(msg))
    }) as Observable<ParsedWSMsg>
  }

  /**
   * 结合 on/off 方法，创建一个监听符合 pattern 事件的流，并包含 teardown 逻辑。
   */
  private createMsg$(pattern: string, teardown?: MsgHandlerRemoval): Observable<ParsedWSMsg> {
    return Observable.create((observer: Observer<ParsedWSMsg>) => {
      const nexter: MsgHandler = (msg) => observer.next(msg)

      const off = this.on(pattern, nexter)
      return !teardown ? off : () => {
        off()
        teardown()
      }
    })
  }

  /**
   * 初始化在激活状态下主动触发、在挂起状态下懒触发地监听给定 pattern 的 daemon。
   */
  private initDaemon(pattern: string): Daemon {
    const start$ = new Subject()
    const suspend$ = new Subject()

    const published$ = Observable.merge(
      suspend$.switchMap(() => this.createMsg$(pattern).takeUntil(start$).takeLast(1)),
      start$.switchMap(() => this.createMsg$(pattern).takeUntil(suspend$))
    ).publish()

    const connection = published$.connect()

    return { start$, suspend$, published$, connection }
  }

  // 如果不能根据给定的 daemonKey 找到对应的 daemon，返回 undefined
  private startDaemon(daemonKey: string) {
    if (!this.daemonManager.has(daemonKey)) {
      return
    }

    const { start$, suspend$ } = this.daemonManager.get(daemonKey)!

    start$.next()

    return () => {
      suspend$.next()
    }
  }

  stopDaemon(daemonKey: string) {
    if (!this.daemonManager.has(daemonKey)) {
      return
    }

    const { connection } = this.daemonManager.get(daemonKey)!

    connection.unsubscribe()
    this.daemonManager.delete(daemonKey)
  }

  /**
   * 结合 daemon 的行为，实现部分 refresh 推送消息处理需要的操作。
   * 注意：为了实现功能，由该方法创建的 daemon 不会被删除。
   */
  private onRefreshEvent(pattern: string, appNamespace: string, callback: MsgHandler) {
    const daemonKey = `${appNamespace}/${pattern}`

    if (!this.daemonManager.has(daemonKey)) {
      this.daemonManager.set(daemonKey, this.initDaemon(pattern))
    }

    const { published$ } = this.daemonManager.get(daemonKey)!
    const subs = published$.subscribe(callback)
    const suspendDaemon = this.startDaemon(daemonKey)!
    return () => {
      suspendDaemon()
      subs.unsubscribe()
    }
  }

}

/**
 * 中间件通过返回 ControlFlow 的值来控制自身对一整个序列的
 * 中间件执行流程的影响。
 */
export enum ControlFlow {
  /**
   * 当返回 PassThrough，中间件不影响序列中下一个中间件的执行。
   */
  PassThrough,

  /**
   * 当返回 ShortCircuit，中间件截断所在中间件序列的执行流程，
   * 不执行其后的中间件，如 switch 语句中 break 的效果。
   */
  ShortCircuit
}

export function createInterceptor(userFn: CustomMsgHandler, flags: Flags = {}): Interceptor {
  const create: InterceptorCreator = flags.mutate ? mutateMessage : keepMessage

  return create(userFn)
}

const mutateMessage: InterceptorCreator = (handler) =>
  (msg, ...args: any[]) => handler.call(null, msg, ...args)

const keepMessage: InterceptorCreator = (handler) =>
  (msg, ...args: any[]) => handler.call(null, createProxy(msg), ...args)
