'use strict'
import 'tslib'
import 'core-js/es6/promise'
import 'core-js/es6/set'
import 'core-js/es6/map'
import 'core-js/es6/weak-map'
import './rxjs/toLoading'
import 'rxjs/add/operator/subscribeOn'
import BaseFetch from './fetchs/BaseFetch'
import StrikerFetch from './fetchs/StrikerFetch'

import { forEach, assign, clone, uuid, concat, dropEle } from './utils/index'

export const Utils = { forEach, assign, clone, uuid, concat, dropEle }
export { testable } from './testable'
export * from './utils/Fetch'
export { eventParser } from './sockets/EventParser'

// typings
export * from './teambition'

export * from './schemas'

// export fetchs

export * from './fetchs'

/* istanbul ignore next */
export function setToken(token: string): void {
  BaseFetch.fetch.setToken(token)
}

/* istanbul ignore next */
export function setHeaders(headers: any): void {
  BaseFetch.fetch.setHeaders(headers)
}

/* istanbul ignore next */
export function setAPIHost(host: string): void {
  BaseFetch.fetch.setAPIHost(host)
}

/* istanbul ignore next */
export function setStrikerHost(host: string): void {
  StrikerFetch.setHost(host)
}

// export apis

export * from './apis'

// for socket

import { SocketClient as Client } from './sockets/SocketClient'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

export interface SDK {
  readonly version: '0.5.1'
  readonly socket: Client
}

const sdk = {
  version: '0.5.1',
  socket: new Client()
}

export const SocketClient: Client = sdk.socket
