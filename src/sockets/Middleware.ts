import { Database } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/publishReplay'

import { forEach, ParsedWSMsg, createProxy, eventToRE } from '../utils'

export type Flags = {
  /**
   * 中间件默认获得原消息对象的拷贝，无需担心对所得消息的变动会
   * 影响其他中间件获取原消息内容。设置 mutate 为 true，则中间件
   * 直接获得原消息对象，对其的变动会影响后续中间件所得消息的内容。
   */
  mutate?: boolean
}

export type MsgHandler = (msg: ParsedWSMsg) => void

export type MsgToDBHandler = (
  msg: ParsedWSMsg,
  db: Database,
) => void | ControlFlow

export type CustomMsgHandler = MsgHandler | MsgToDBHandler

export type Interceptor = (msg: ParsedWSMsg, ...args: any[]) => void | ControlFlow

type InterceptorCreator = (handler: CustomMsgHandler) => Interceptor

export type SequenceRemoveToken = () => void

class Sequence {

  private interceptors: Interceptor[] = []

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
    let cf: ControlFlow = ControlFlow.PassThrough

    forEach(this.interceptors, (interceptor): void | false => {
      cf = interceptor(msg, ...args) || ControlFlow.PassThrough

      if (cf === ControlFlow.ShortCircuit || cf === ControlFlow.IgnoreDefaultDBOps) {
        return false
      }
    })

    return cf
  }

}

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

/**
 * websocket 代理。
 * 使用 Proxy 来为与数据模型无关的推送消息进行相应处理。
 */
export class WSProxy {

  private seq: Sequence = new Sequence()
  private proxyHandler: WSProxyConfig[] = []
  private publishedHandler: Map<string, PublishedSource> = new Map<string, PublishedSource>()

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
    this.proxyHandler.push({ clean: removeToken, pattern, handler: handler })
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
    const source = origin.publishReplay(1).refCount()
    const cleanUp = () => {
      this.off(pattern, handler)
      origin.complete()
      this.publishedHandler.delete(pattern)
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
  ShortCircuit,

  /**
   * 当返回 IgnoreDefaultDBOps，中间件在截断所在中间件序列
   * 执行流程的同时，告诉外部，不执行默认数据库操作。
   */
  IgnoreDefaultDBOps
}

export function createInterceptor(userFn: CustomMsgHandler, flags: Flags = {}): Interceptor {
  const create: InterceptorCreator = flags.mutate ? mutateMessage : keepMessage

  return create(userFn)
}

const mutateMessage: InterceptorCreator = (handler) =>
  (msg, ...args: any[]) => handler.call(null, msg, ...args)

const keepMessage: InterceptorCreator = (handler) =>
  (msg, ...args: any[]) => handler.call(null, createProxy(msg), ...args)
