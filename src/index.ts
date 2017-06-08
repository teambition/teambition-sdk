/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle } from './utils/index'

export const Utils = { forEach, clone, uuid, concat, dropEle }
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis'

import './schemas'
export * from './schemas'

export { SDK } from './SDK'
export { SDKFetch } from './SDKFetch'
export { Net, CacheStrategy, Http, HttpErrorMessage } from './Net'

// export const SocketClient: Client = sdk.socket
