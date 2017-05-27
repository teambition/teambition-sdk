/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle, pagination } from './utils/index'

export const Utils = { forEach, clone, uuid, concat, dropEle, pagination }
export * from './utils/Fetch'
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis'

import './schemas'
export * from './schemas'

export { SDK } from './SDK'
export { SDKFetch } from './SDKFetch'
export { Net, CacheStrategy } from './Net'

// export const SocketClient: Client = sdk.socket
