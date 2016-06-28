'use strict'
import 'es6-promise'
import 'isomorphic-fetch'
import 'es6-collections'
import BaseFetch from './fetchs/BaseFetch'

import { forEach, assign, clone, uuid, concat, dropEle } from './utils/index'

export const Utils = { forEach, assign, clone, uuid, concat, dropEle }
export * from './utils/Fetch'
export { eventParser } from './sockets/EventParser'

// typings
export * from './teambition'

export { default as EventSchema } from './schemas/Event'
export { default as MemberSchema } from './schemas/Member'
export { default as MySubtaskSchema } from './schemas/MySubtask'
export { default as PostSchema } from './schemas/Post'
export { default as ProjectSchema } from './schemas/Project'
export { default as StageSchema } from './schemas/Stage'
export { default as TaskSchema } from './schemas/Task'
export { default as TasklistSchema } from './schemas/Tasklist'
export { default as ActivitySchema } from './schemas/Activity'

// export fetchs

export { default as MemberFetch } from './fetchs/MemberFetch'
export { default as OrganizationFetch } from './fetchs/OrganizationFetch'
export { default as ProjectFetch } from './fetchs/ProjectFetch'
export { default as UserFetch } from './fetchs/UserFetch'
export { default as TasklistFetch } from './fetchs/TasklistFetch'
export { default as StageFetch } from './fetchs/StageFetch'
export { default as TaskFetch } from './fetchs/TaskFetch'
export { default as SubtaskFetch } from './fetchs/SubtaskFetch'
export { default as ActivityFetch } from './fetchs/ActivityFetch'
export { default as StrikerFetch } from './fetchs/StrikerFetch'

export function setToken(token: string): void {
  BaseFetch.fetch.setToken(token)
}

export function setAPIHost(host: string) {
  BaseFetch.fetch.setAPIHost(host)
}

// export apis

export * from './apis/MemberAPI'
export * from './apis/OrganizationsAPI'
export * from './apis/ProjectsAPI'
export * from './apis/PostAPI'
export * from './apis/UserAPI'
export * from './apis/StageAPI'
export * from './apis/TasklistAPI'
export * from './apis/TaskAPI'
export * from './apis/SubtaskAPI'
export * from './apis/ActivityAPI'
export * from './apis/FileAPI'

// for socket

import { SocketClient } from './sockets/SocketClient'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

ctx['teambition'] = Object.create(null)

const teambition = ctx['teambition']

const sdk = teambition.sdk = Object.create(null)

sdk.version = '0.2.1'

sdk.socket = new SocketClient()

export const client: SocketClient = sdk.socket
