/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle, hasMorePages, pagination, pathToRE } from './utils'

export { hasMorePages, pagination }
export const Utils = { forEach, clone, uuid, concat, dropEle }
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis'

import './schemas'
export * from './schemas'

import * as EventSDK from './apis/event'
export { EventSDK }

import * as Socket from './sockets'
export { Socket, pathToRE as socketEventToRE }
export { pathToRE }

export { SDK } from './SDK'
export { SDKFetch, HttpHeaders } from './SDKFetch'
export { Net, CacheStrategy, Http, HttpErrorMessage, HttpError$, Page } from './Net'

// export const SocketClient: Client = sdk.socket
