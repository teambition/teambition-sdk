'use strict'
import 'engine.io-client'
import 'jsonrpc-lite'

declare const require: any

const Consumer = require('snapper-consumer')

const client = new Consumer()

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

const teambition = ctx['teambition']
if (teambition) {
  const sdk = teambition.sdk
  if (sdk) {
    const socket = sdk.socket
    if (socket) {
      socket.connect(client)
    }
  }
}
