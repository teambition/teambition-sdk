/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle } from './utils/index'

export const Utils = { forEach, clone, uuid, concat, dropEle }
export * from './utils/Fetch'
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis/posts'

import './schemas'
export * from './schemas'

export { SDK } from './SDK'
export { SDKFetch } from './SDKFetch'

// export const SocketClient: Client = sdk.socket
