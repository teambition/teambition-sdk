'use strict'
import 'engine.io-client'
import 'jsonrpc-lite'

declare const require: any

const Consumer = require('snapper-consumer')

const client = new Consumer()

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

const teambition = ctx['teambition']

if (teambition && teambition.sdk && teambition.sdk.socket) {
  const socket = teambition.sdk.socket
  socket.initClient(client)
}
