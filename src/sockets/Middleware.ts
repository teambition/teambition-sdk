import 'rxjs/add/operator/publish'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/takeLast'
import 'rxjs/add/observable/merge'
import { Database } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable'
import { shareReplay } from 'rxjs/operators/shareReplay'
import { Subject } from 'rxjs/Subject'

import { forEach, ParsedWSMsg, createProxy, eventToRE } from '../utils'

export type Flags = {
  /**
   * 中间件默认获得原消息对象的拷贝，无需担心对所得消息的变动会
   * 影响其他中间件获取原消息内容。设置 mutate 为 true，则中间件
   * 直接获得原消息对象，对其的变动会影响后续中间件所得消息的内容。
   */
  mutate?: boolean
}

export type CustomMsgHandler = MsgHandler | MsgToDBHandler

export type Interceptor = (msg: ParsedWSMsg, ...args: any[]) => void | ControlFlow | Observable<any>

type InterceptorCreator = (handler: CustomMsgHandler) => Interceptor

export type SequenceRemoveToken = () => void

class Sequence {

  private interceptors: Interceptor[] = []
  private sink: Interceptor | null = null

  append(handler: CustomMsgHandler, options: Flags = {}): SequenceRemoveToken {
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
export type FinalMsgToDBHandler = (msg: ParsedWSMsg, db: Database) => Observable<any>

/**
 * websocket 拦截器的序列。
 */
export class Interceptors {

  private seq: Sequence = new Sequence()

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

  setDestination(handler: FinalMsgToDBHandler) {
    this.seq.setSink(handler)
  }
}

export interface WSProxyConfig {
  clean: SequenceRemoveToken
  pattern: string
  handler: Function
}

export interface PublishedSource {
  source: Observable<ParsedWSMsg>
  clean: SequenceRemoveToken
}

type Deamon = {
  start$: Subject<any>,
  suspend$: Subject<any>,
  published$: ConnectableObservable<ParsedWSMsg>,
  connection: Subscription,
  subscriberCount?: number
}

export type MsgHandler = (msg: ParsedWSMsg) => void

/**
 * websocket 代理。
 * 使用 Proxy 来为与数据模型无关的推送消息进行相应处理。
 */
export class WSProxy {

  private seq: Sequence = new Sequence()
  private proxyHandler: WSProxyConfig[] = []
  private publishedHandler: Map<string, PublishedSource> = new Map<string, PublishedSource>()
  private deamonManager: Map<string, Deamon> = new Map()

  /**
   * 注册一个代理。
   * 该代理将会获得原推送消息经解析后的消息对象。
   */
  register(handler: MsgHandler) {
    return this.seq.append(handler)
  }
  /**
   * 根据 pattern 注册一个代理。
   * 该代理将会获得原推送消息经解析后的消息对象。
   * pattern 支持正则
   */
  on(pattern: string, handler: Function) {
    const re = eventToRE(pattern)

    const callback = (msg: ParsedWSMsg) => {
      if (msg.source && re.test(msg.source)) {
        handler(msg)
      }
      re.lastIndex = 0
      return ControlFlow.PassThrough
    }

    const removeToken = this.seq.append(callback)
    this.proxyHandler.push({ clean: removeToken, pattern, handler })
  }

  /**
   * 移除某个 pattern 下的代理
   */
  off(pattern: string, handler: Function) {
    const ret: WSProxyConfig[] = []

    this.findHandler((target) => {
      if (target.handler === handler && target.pattern === pattern) {
        target.clean()
      } else {
        // dingwen: ad-hoc TODO refactor with findhandler
        ret.push(target)
      }
    })

    this.proxyHandler = ret
  }

  /**
   * 根据某个 pattern 持续订阅某个 socket event, e.g. publish(':change:task/:id')
   * 以 socket type 开头 例如: change、new、remove、destroy、refresh
   * 建议搭配全局 refresh 使用, 集合的单一资源 refresh 场景可以使用 on 接口
   */

  publish(pattern: string): Observable<ParsedWSMsg> {
    if (this.publishedHandler.has(pattern)) {
      return this.publishedHandler.get(pattern)!.source
    }

    const origin = new Subject<ParsedWSMsg>()
    const handler = (msg: ParsedWSMsg) => {
      origin.next(msg)
    }
    this.on(pattern, handler)
    const source = origin.pipe(shareReplay(1))
    const cleanUp = () => {
      this.off(pattern, handler)
      origin.complete()
    }
    this.publishedHandler.set(pattern, { source, clean: cleanUp })
    return source
  }

  /**
   * 移除某个持续订阅的 socket event
   */
  unpublish(pattern: string) {
    if (this.publishedHandler.has(pattern)) {
      const { clean } = this.publishedHandler.get(pattern)!
      clean()
      this.publishedHandler.delete(pattern)
    }
  }

  /**
   * 结合 on/off 方法，创建一个监听符合 pattern 事件的流，并包含 teardown 逻辑。
   */
  private createMsg$(pattern: string): Observable<ParsedWSMsg> {
    return Observable.create((observer: Observer<ParsedWSMsg>) => {
      const nexter: MsgHandler = (msg) => observer.next(msg)
      this.on(pattern, nexter)

      return () => {
        this.off(pattern, nexter)
      }
    })
  }

  /**
   * 初始化在激活状态下主动触发、在挂起状态下懒触发的监听给定 pattern 的 deamon。
   */
  private initDeamon(pattern: string): Deamon {
    const start$ = new Subject()
    const suspend$ = new Subject()

    const published$ = Observable.merge(
      suspend$.switchMap(() => this.createMsg$(pattern).takeUntil(start$).takeLast(1)),
      start$.switchMap(() => this.createMsg$(pattern).takeUntil(suspend$))
    ).publish()

    const connection = published$.connect()

    return { start$, suspend$, published$, connection }
  }

  /**
   * 激活监听给定 pattern 的 deamon，令其在受到相应消息时及时触发 callback。
   * 返回 teardown 逻辑。
   */
  activate(pattern: string, callback: MsgHandler) {
    if (!this.deamonManager.has(pattern)) {
      this.deamonManager.set(pattern, this.initDeamon(pattern))
    }

    const { start$, suspend$, published$ } = this.deamonManager.get(pattern)!

    const subscription = published$.subscribe(callback)

    start$.next({})

    return () => {
      suspend$.next({})
      subscription.unsubscribe()
    }
  }

  /**
   * 将一条推送消息广播给所有注册的代理。
   */
  apply: MsgHandler = (msg) => {
    this.seq.apply(msg)
  }

  private findHandler(callback: (target: WSProxyConfig) => void) {
    for (let i = 0; i < this.proxyHandler.length; i++) {
      const target = this.proxyHandler[i]
      callback(target)
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
