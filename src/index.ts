/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle, hasMorePages, pagination } from './utils/index'

export { hasMorePages, pagination }
export const Utils = { forEach, clone, uuid, concat, dropEle }
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis'

import './schemas'
export * from './schemas'

export { SDK } from './SDK'
export { SDKFetch } from './SDKFetch'
export { Net, CacheStrategy, Http, HttpErrorMessage, HttpError$ } from './Net'

// export const SocketClient: Client = sdk.socket
