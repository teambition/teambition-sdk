import { Database } from 'reactivedb'

import { clone, forEach, ParsedWSMsg } from '../utils'

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
  tabName: string,
  pkName: string
) => void | ControlFlow

export type CustomMsgHandler = MsgHandler | MsgToDBHandler

export type Interceptor = (msg: ParsedWSMsg, ...args: any[]) => void | ControlFlow

type InterceptorCreator = (handler: CustomMsgHandler) => Interceptor

class Sequence {

  private interceptors: Interceptor[] = []

  append(handler: CustomMsgHandler, options: Flags = {}) {
    this.interceptors.push(createInterceptor(handler, options))
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
    this.seq.append(handler, options)
  }

  /**
   * 传入 websocket 消息内容，及相关数据库信息，从头到尾执行序列中的拦截器。
   * 如果其中一个拦截器返回 ControlFlow.ShortCircuit，其后续的中间件将被跳过，不执行。
   * 如果一个拦截器返回 ControlFlow.IngoreDefaultDBOps，不仅跳过（不执行）后续拦截器，
   * 也会跳过本会对传入消息进行的默认数据库操作。
   */
  apply: MsgToDBHandler = (msg, db, tabName, pkName) => {
    return this.seq.apply(msg, db, tabName, pkName)
  }
}

/**
 * websocket 代理。
 * 使用 Proxy 来为与数据模型无关的推送消息进行相应处理。
 */
export class Proxy {

  private seq: Sequence = new Sequence()

  /**
   * 注册一个代理。
   * 该代理将会获得原推送消息经解析后的消息对象。
   */
  register(handler: MsgHandler) {
    this.seq.append(handler)
  }

  /**
   * 将一条推送消息广播给所有注册的代理。
   */
  apply: MsgHandler = (msg) => {
    this.seq.apply(msg)
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
  (msg, ...args: any[]) => handler.call(null, clone(msg), ...args)
