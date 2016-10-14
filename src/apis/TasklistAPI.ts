'use strict'
import { Observable } from 'rxjs/Observable'
import TasklistFetch, {
  CreateTasklistOptions,
  UpdateTasklistOptions,
  ArchiveTasklistResponse,
  UnarchiveTasklistResponse
} from '../fetchs/TasklistFetch'
import TasklistModel from '../models/TasklistModel'
import { TasklistData } from '../schemas/Tasklist'
import { makeColdSignal } from './utils'

export class TasklistAPI {

  create(option: CreateTasklistOptions): Observable<TasklistData> {
    return TasklistFetch.create(option)
      .concatMap(r => TasklistModel.addOne(r).take(1))
  }

  getTasklists(_projectId: string, query?: any): Observable<TasklistData[]> {
    return makeColdSignal<TasklistData[]>(() => {
      const get = TasklistModel.getTasklists(_projectId)
      if (get) {
        return get
      }
      return TasklistFetch.getTasklists(_projectId, query)
        .concatMap(tasklists => TasklistModel.addTasklists(_projectId, tasklists))
    })
  }

  getOne(_tasklistId: string, query?: any): Observable<TasklistData> {
    return makeColdSignal<TasklistData>(() => {
      const get = TasklistModel.getOne(_tasklistId)
      if (get && TasklistModel.checkSchema(_tasklistId)) {
        return get
      }
      return TasklistFetch.get(_tasklistId, query)
        .concatMap(tasklist => TasklistModel.addOne(tasklist))
    })
  }

  update(_tasklistId: string, patch: UpdateTasklistOptions): Observable<UpdateTasklistOptions> {
    return TasklistFetch.update(_tasklistId, patch)
      .concatMap(tasklist => TasklistModel.update(_tasklistId, tasklist))
  }

  delete(_tasklistId: string): Observable<void> {
    return TasklistFetch.delete(_tasklistId)
      .concatMap(x => TasklistModel.delete(_tasklistId))
  }

  archive(_tasklistId: string): Observable<ArchiveTasklistResponse> {
    return TasklistFetch.archive(_tasklistId)
      .concatMap(tasklist => TasklistModel.update(_tasklistId, tasklist))
  }

  unArchive(_tasklistId: string): Observable<UnarchiveTasklistResponse> {
    return TasklistFetch.unarchive(_tasklistId)
      .concatMap(x => TasklistModel.update(_tasklistId, x))
  }
}

export default new TasklistAPI
