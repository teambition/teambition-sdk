import { Database } from 'reactivedb'

import { clone, forEach } from '../utils'
import { SDKLogger } from '../utils/Logger'
import { MessageResult } from '../sockets/EventParser'

export type Flags = {
  mutateMessage?: boolean,
  shortCircuit?: boolean,
  shortCircuitAndIgnoreDefaultDBOps?: boolean,
}

export type UserFunc = (
  msg: MessageResult,
  db?: Database,
  tabName?: string,
  pkName?: string
) => void | ControlFlowGiveUp

export type Interceptor = (
  msg: MessageResult,
  db?: Database,
  tabName?: string,
  pkName?: string
) => ControlFlow

export class Sequence {

  private interceptors: Interceptor[] = []

  append(userFn: UserFunc, options: Flags = {}) {
    this.interceptors.push(createInterceptor(userFn, options))
  }

  apply: Interceptor = (msg, db, tabName, pkName) => {
    let ret: ControlFlow = ControlFlow.PassThrough

    forEach(this.interceptors, (interceptor): void | false => {
      ret = interceptor(msg, db, tabName, pkName)
      if ((ret & ControlFlow.ShortCircuit) === ControlFlow.ShortCircuit) {
        return false
      }
    })

    return ret
  }
}

export enum ControlFlow {
  PassThrough = 0,
  ShortCircuit = 1 << 0,
  IgnoreDefaultDBOps = 1 << 1,
  ShortCircuitAndIgnoreDefaultDBOps = ShortCircuit | IgnoreDefaultDBOps,
}

export enum ControlFlowGiveUp {
  KeepFlags = ~ 0,
  GiveUpShortCircuit = ~ ControlFlow.ShortCircuit,
  GiveUpIgnoreDefaultDBOps = ~ ControlFlow.IgnoreDefaultDBOps,
  GiveUpShortCircuitAndIgnoreDefaultDBOps = GiveUpShortCircuit & GiveUpIgnoreDefaultDBOps
}

const collectGiveUpFlags = (
  userFuncResult: void | ControlFlowGiveUp,
  userFuncName: string
): ControlFlowGiveUp => {

  switch (userFuncResult) {
    case ControlFlowGiveUp.KeepFlags:
    case ControlFlowGiveUp.GiveUpShortCircuit:
    case ControlFlowGiveUp.GiveUpIgnoreDefaultDBOps:
    case ControlFlowGiveUp.GiveUpShortCircuitAndIgnoreDefaultDBOps:
      return userFuncResult as ControlFlowGiveUp
    default:
      if (userFuncResult != null) {
        SDKLogger.warn(
          `Return value: ${userFuncResult}, of interceptor ${userFuncName}`,
          'is not a valid ControlFlowGiveUp flag; thus ignored.'
        )
      }
      return ControlFlowGiveUp.KeepFlags
  }

}

export function createInterceptor(userFn: UserFunc, flags: Flags = {}) {
  const ignoreDefaultDBOps = 1 << 0
  const shortCircuit = 1 << 1
  const mutateMessage = 1 << 2

  const index = (flags.mutateMessage ? mutateMessage : 0)
    | (flags.shortCircuit ? shortCircuit : 0)
    | (flags.shortCircuitAndIgnoreDefaultDBOps ? shortCircuit | ignoreDefaultDBOps : 0)

  return interceptorCreatorChoices[index](userFn)
}

type InterceptorCreator = (userFn: UserFunc) => (msg: MessageResult) => ControlFlow

const placeholder: InterceptorCreator = (_) => (__) => ControlFlow.PassThrough

// 下列有的 index 下的函数不会被使用到，使用 placeholder 填补
const interceptorCreatorChoices: InterceptorCreator[] = [
  // f000 - passthrough
  (userFn) => (msg) => {
    const msgClone = clone(msg)
    const giveUpFlags = collectGiveUpFlags(userFn(msgClone), userFn.name)
    return ControlFlow.PassThrough & giveUpFlags
  },

  // f001 - ignore default db ops
  placeholder,

  // f010 - short circuit
  (userFn) => (msg) => {
    const msgClone = clone(msg)
    const giveUpFlags = collectGiveUpFlags(userFn(msgClone), userFn.name)
    return ControlFlow.ShortCircuit & giveUpFlags
  },

  // f011 - short circuit and ignore default db ops
  (userFn) => (msg) => {
    const msgClone = clone(msg)
    const giveUpFlags = collectGiveUpFlags(userFn(msgClone), userFn.name)
    return ControlFlow.ShortCircuitAndIgnoreDefaultDBOps & giveUpFlags
  },

  // f100 - mutate message
  (userFn) => (msg) => {
    const giveUpFlags = collectGiveUpFlags(userFn(msg), userFn.name)
    return ControlFlow.PassThrough & giveUpFlags
  },

  // f101 - mutate message and ignore default db ops
  placeholder,

  // f110 - mutate message and short circuit
  (userFn) => (msg) => {
    const giveUpFlags = collectGiveUpFlags(userFn(msg), userFn.name)
    return ControlFlow.ShortCircuit & giveUpFlags
  },

  // f111 - mutate message, short circuit, and ignore default db ops
  (userFn) => (msg) => {
    const giveUpFlags = collectGiveUpFlags(userFn(msg), userFn.name)
    return ControlFlow.ShortCircuitAndIgnoreDefaultDBOps & giveUpFlags
  }
]
