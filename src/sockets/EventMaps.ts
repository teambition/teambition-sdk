'use strict'
import 'rxjs/add/operator/retry'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import Dirty from '../utils/Dirty'
import UserModel from '../models/UserModel'
import PreferenceModel from '../models/PreferenceModel'
import TaskModel from '../models/TaskModel'
import SubtaskModel from '../models/SubtaskModel'
import EventModel from '../models/EventModel'
import PostModel from '../models/PostModel'
import CollectionModel from '../models/CollectionModel'
import FileModel from '../models/FileModel'
import TasklistModel from '../models/TasklistModel'
import StageModel from '../models/StageModel'
import TagModel from '../models/TagModel'
import ActivityModel from '../models/ActivityModel'
import HomeActivityModel from '../models/HomeActivityModel'
import MessageModel from '../models/MessageModel'
import MemberModel from '../models/MemberModel'
import ProjectModel from '../models/ProjectModel'
import SubscribeModel from '../models/SubscribeModel'
import FeedbackModel from '../models/FeedbackModel'
import ProjectFetch from '../fetchs/ProjectFetch'
import { MessageResult, eventParser } from './EventParser'
import { forEach } from '../utils/index'

const typeMap: any = {
  'homeActivities': HomeActivityModel,
  'homeActivity': HomeActivityModel,
  'activities': ActivityModel,
  'activity': ActivityModel,
  'message': MessageModel,
  'project': ProjectModel,
  'task': TaskModel,
  'event': EventModel,
  'subtask': SubtaskModel,
  'post': PostModel,
  'work': FileModel,
  'tasklist': TasklistModel,
  'stage': StageModel,
  'collection': CollectionModel,
  'tag': TagModel,
  'user': UserModel,
  'preference': PreferenceModel,
  'member': MemberModel,
  'subscriber': SubscribeModel,
  'feedback': FeedbackModel
}

const methodMap: any = {
  'change': 'update',
  'new': 'addOne',
  'destroy': 'delete'
}

export function socketHandler (event: RequestEvent): Observable<any> {
  const signals: Observable<any>[] = []
  const socketMessages = eventParser(event)
  forEach(socketMessages, socketMessage => {
    signals.push(handler(socketMessage))
  })
  return Observable.from(signals)
    .mergeAll()
}

/**
 * refresh 事件需要逐个单独处理
 * destroy 事件没有 data
 */
function handler(socketMessage: MessageResult) {
  const method = socketMessage.method
  let type = socketMessage.type
  if (type.charAt(type.length - 1) === 's' &&
      type !== 'activities' &&
      type !== 'homeActivities') {
    type = type.substring(0, type.length - 1)
  }
  const id = socketMessage.id
  const data = socketMessage.data
  const _method = methodMap[method]
  const model = typeMap[type]
  if (
    (method !== 'destroy' && model && typeof data === 'object' && (!!id || method === 'new')) ||
    (method === 'destroy' && model && id && _method)
  ) {
    switch (method) {
      case 'new':
        if (data instanceof Array && data.length) {
          return Observable.from<any>(data.map((value: any) => {
            return model[_method](value).take(1)
          }))
            .mergeAll()
            .skip(data.length - 1)
        } else {
          return model[_method](data)
            .take(1)
        }
      case 'change':
        const length = model[_method].length
        const dirtyStream = Dirty.handlerLikeMessage(id, type, data)
        if (dirtyStream) {
          return dirtyStream
        }
        switch (length) {
          case 1:
            return model[_method](data)
          /* istanbul ignore case */
          case 2:
            return model[_method](id, data)
        }
      case 'destroy':
        return model[_method](id)
    }
  }
  if (method === 'refresh') {
    switch (type) {
      case 'project':
        let projectid = data
        return Observable.fromPromise(ProjectFetch.getOne(projectid))
          .concatMap(project => ProjectModel.addOne(project))
          .take(1)
    }
    return Observable.of(null)
  } else if (method === 'remove') {
    switch (type) {
      case 'project':
        const projectId = data
        return ProjectModel.delete(projectId)
    }
  }
  return Observable.of(null)
}
