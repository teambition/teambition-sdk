/// <reference path="./teambition.ts" />
import 'tslib'

import { forEach, clone, uuid, concat, dropEle, hasMorePages, pagination, eventToRE, parseHeaders } from './utils'

export { hasMorePages, pagination }
export const Utils = { forEach, clone, uuid, concat, dropEle, parseHeaders }
export { eventParser } from './sockets/EventParser'

// export apis
import './sockets/SocketClient'
import './apis'

import './schemas'
export * from './schemas'

import * as EventSDK from './apis/event'
export { EventSDK }

import * as Socket from './sockets'
export { Socket, eventToRE as socketEventToRE }

export { SDK } from './SDK'
export { SDKFetch, HttpHeaders } from './SDKFetch'
export { Net, CacheStrategy, Http, HttpErrorMessage, HttpError$, Page, WebClient, AllowedHttpMethod } from './Net'

export { Database, ExecutorResult, QueryToken, OrderDescription, Query, Predicate } from './db'

export { GraphQLQuery, GraphQLMeta, GraphQLVariables, GraphQLResult } from './utils'

// export const SocketClient: Client = sdk.socket
