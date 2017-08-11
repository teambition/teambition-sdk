import { SDKLogger } from './Logger'

const throwReAssignError = (prop: string) => {
  SDKLogger.error(`${prop} cannot be reassigned to different values or point to different objects with mutate = false`)
}

const immutableObjectTraps = {
  get(target: any, prop: string) {
    const value = target[prop]
    if (isProxyable(value)) {
      return createProxyInDev(value)
    } else {
      return value
    }
  },
  set(_1: any, prop: string, _2: any) {
    throwReAssignError(prop)
    return true
  },
  deleteProperty(_1: any, prop: string) {
    throwReAssignError(prop)
    return true
  },
  defineProperty(_1: any, prop: string, _2: object) {
    throwReAssignError(prop)
    return true
  }
}

const immutableArrayTraps = {
  get(target: any, prop: string) {
    const value = target[prop]
    if (isProxyable(value)) {
      return createProxyInDev(value)
    } else {
      return value
    }
  },
  set(_1: any, prop: string, _2: any) {
    throwReAssignError(prop)
    return true
  },
  deleteProperty(_1: any, prop: string) {
    throwReAssignError(prop)
    return true
  },
  defineProperty(_: any, prop: string) {
    throwReAssignError(prop)
    return true
  }
}

const isProxyable = <T>(value: T) => {
  if (!value) {
    return false
  }

  if (typeof value !== 'object') {
    return false
  }

  if (Array.isArray(value)) {
    return true
  }

  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

const createProxyInDev = <T extends object>(target: T): T => {
  if (Array.isArray(target)) {
    return new Proxy(target, immutableArrayTraps)
  }
  return new Proxy(target, immutableObjectTraps)
}

let port: <T extends object>(target: T) => T = <T extends object>(target: T) => target

if (process.env.NODE_ENV !== 'production') {
  port = createProxyInDev
}

export const createProxy = port
