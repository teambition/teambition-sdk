'use strict'
import { Observable } from 'rxjs/Observable'
import { RequestEvent } from 'snapper-consumer'
import UserModel from '../models/UserModel'
import TaskModel from '../models/TaskModel'
import SubtaskModel from '../models/SubtaskModel'
import PostModel from '../models/PostModel'
import CollectionModel from '../models/CollectionModel'
import WorkModel from '../models/WorkModel'
import TasklistModel from '../models/TasklistModel'
import StageModel from '../models/StageModel'
import TagModel from '../models/TagModel'
import ActivityModel from '../models/ActivityModel'
import ProjectModel from '../models/ProjectModel'
import ProjectFetch from '../fetchs/ProjectFetch'
import { MessageResult, eventParser } from './EventParser'
import { forEach } from '../utils/index'

const typeMap: any = {
  'activity': ActivityModel,
  'project': ProjectModel,
  'task': TaskModel,
  'subtask': SubtaskModel,
  'post': PostModel,
  'work': WorkModel,
  'tasklist': TasklistModel,
  'stage': StageModel,
  'collection': CollectionModel,
  'tag': TagModel,
  'user': UserModel
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
 */
function handler(socketMessage: MessageResult) {
  const method = socketMessage.method
  let type = socketMessage.type
  if (type.charAt(type.length - 1) === 's') {
    type = type.substring(0, type.length - 1.)
  }
  const id = socketMessage.id
  const data = socketMessage.data
  const _method = methodMap[method]
  const model = typeMap[type]
  if (model && typeof data === 'object' && data._id) {
    switch (method) {
      case 'new':
        return model[_method](data)
      case 'change':
        return model[_method](id, data)
      case 'destroy':
        return model[_method](id)
    }
    if (method === 'refresh') {
      switch (type) {
        case 'projects':
          let projectid = data
          return Observable.fromPromise(ProjectFetch.getOne(projectid))
            .concatMap(project => ProjectModel.addOne(project))
      }
      return Observable.of(null)
    }
  }
  return Observable.of(null)
}
