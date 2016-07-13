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

export { EventData as EventSchema } from './schemas/Event'
export { EntrycategoryData as EntrycategorySchema } from './schemas/Entrycategory'
export { MemberData as MemberSchema } from './schemas/Member'
export { MySubtaskData as MySubtaskSchema } from './schemas/MySubtask'
export { SubtaskData as SubtaskSchema } from './schemas/Subtask'
export { PostData as PostSchema } from './schemas/Post'
export { ProjectData as ProjectSchema } from './schemas/Project'
export { StageData as StageSchema } from './schemas/Stage'
export { TaskData as TaskSchema } from './schemas/Task'
export { TasklistData as TasklistSchema } from './schemas/Tasklist'
export { ActivityData as ActivitySchema } from './schemas/Activity'
export { OrganizationData as OrganizationSchema } from './schemas/Organization'
export { FileData as FileSchema } from './schemas/File'
export { TBCollectionData as TBCollectionSchema } from './schemas/Collection'
export { UserMe } from './schemas/UserMe'

// export fetchs

export { default as EntrycategoryFetch } from './fetchs/EntrycategoryFetch'
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

export * from './apis/EntrycategoryAPI'
export * from './apis/MemberAPI'
export * from './apis/OrganizationAPI'
export * from './apis/ProjectAPI'
export * from './apis/PostAPI'
export * from './apis/UserAPI'
export * from './apis/StageAPI'
export * from './apis/TasklistAPI'
export * from './apis/TaskAPI'
export * from './apis/SubtaskAPI'
export * from './apis/ActivityAPI'
export * from './apis/FileAPI'
export * from './apis/CollectionAPI'

// for socket

import { SocketClient } from './sockets/SocketClient'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

ctx['teambition'] = Object.create(null)

const teambition = ctx['teambition']

const sdk = teambition.sdk = Object.create(null)

sdk.version = '0.2.8'

sdk.socket = new SocketClient()

export const client: SocketClient = sdk.socket
