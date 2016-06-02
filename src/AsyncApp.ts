'use strict'
import 'engine.io-client'
import 'jsonrpc-lite'
import Consumer from 'snapper-consumer'

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
