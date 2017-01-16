'use strict'
import 'tslib'
import 'engine.io-client'
import 'jsonrpc-lite'
import { SocketClient } from './sockets/SocketClient'

declare const require: any

const Consumer = require('snapper-consumer')

export default function (socket: SocketClient) {
  const client = new Consumer()
  socket.initClient(client)
}
