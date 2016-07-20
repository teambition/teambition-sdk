'use strict'
import 'es6-promise'
import 'isomorphic-fetch'
import 'es6-collections'
import 'rxjs/add/operator/subscribeOn'
import BaseFetch from './fetchs/BaseFetch'

import { forEach, assign, clone, uuid, concat, dropEle } from './utils/index'

export const Utils = { forEach, assign, clone, uuid, concat, dropEle }
export * from './utils/Fetch'
export { eventParser } from './sockets/EventParser'

// typings
export * from './teambition'

export * from'./schemas'

// export fetchs

export * from'./fetchs'

export function setToken(token: string): void {
  BaseFetch.fetch.setToken(token)
}

export function setAPIHost(host: string) {
  BaseFetch.fetch.setAPIHost(host)
}

// export apis

export * from './apis'

// for socket

import { SocketClient as Client } from './sockets/SocketClient'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

ctx['teambition'] = Object.create(null)

const teambition = ctx['teambition']

const sdk = teambition.sdk = Object.create(null)

sdk.version = '0.2.14'

sdk.socket = new Client()

export const SocketClient: Client = sdk.socket
