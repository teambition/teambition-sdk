'use strict'
import { Observable } from 'rxjs'
import { RequestEvent } from 'snapper-consumer'
import UserModel from '../models/UserModel'
import TaskModel from '../models/TaskModel'
import ActivityModel from '../models/ActivityModel'
import ProjectModel from '../models/ProjectModel'
import ProjectFetch from '../fetchs/ProjectFetch'
import { MessageResult, eventParser } from './EventParser'
import { forEach } from '../utils/index'

const typeMap = {
  'activity': ActivityModel,
  'activities': ActivityModel,
  'project': ProjectModel,
  'projects': ProjectModel,
  'tasks': TaskModel,
  'task': TaskModel,
  'user': UserModel
}

const methodMap = {
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

function handler(socketMessage: MessageResult) {
  const method = socketMessage.method
  const type = socketMessage.type
  const id = socketMessage.id
  const data = socketMessage.data
  const _method = methodMap[method]
  const model = typeMap[type]
  if (model) {
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
