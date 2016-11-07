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
import { ProjectId, TasklistId } from '../teambition'

export class TasklistAPI {

  create(option: CreateTasklistOptions): Observable<TasklistData> {
    return TasklistFetch.create(option)
      .concatMap(r =>
        TasklistModel.addOne(r)
          .take(1)
      )
  }

  getTasklists(_projectId: ProjectId, query?: any): Observable<TasklistData[]> {
    return makeColdSignal<TasklistData[]>(() => {
      const get = TasklistModel.getTasklists(_projectId)
      if (get) {
        return get
      }
      return TasklistFetch.getTasklists(_projectId, query)
        .concatMap(tasklists =>
          TasklistModel.addTasklists(_projectId, tasklists)
        )
    })
  }

  getOne(_tasklistId: TasklistId, query?: any): Observable<TasklistData> {
    return makeColdSignal<TasklistData>(() => {
      const get = TasklistModel.getOne(_tasklistId)
      if (get && TasklistModel.checkSchema(<string>_tasklistId)) {
        return get
      }
      return TasklistFetch.get(_tasklistId, query)
        .concatMap(tasklist =>
          TasklistModel.addOne(tasklist)
        )
    })
  }

  update(_tasklistId: TasklistId, patch: UpdateTasklistOptions): Observable<UpdateTasklistOptions> {
    return TasklistFetch.update(_tasklistId, patch)
      .concatMap(tasklist =>
        TasklistModel.update(<string>_tasklistId, tasklist)
      )
  }

  delete(_tasklistId: TasklistId): Observable<void> {
    return TasklistFetch.delete(_tasklistId)
      .concatMap(x =>
        TasklistModel.delete(<string>_tasklistId)
      )
  }

  archive(_tasklistId: TasklistId): Observable<ArchiveTasklistResponse> {
    return TasklistFetch.archive(_tasklistId)
      .concatMap(tasklist =>
        TasklistModel.update(<string>_tasklistId, tasklist)
      )
  }

  unArchive(_tasklistId: TasklistId): Observable<UnarchiveTasklistResponse> {
    return TasklistFetch.unarchive(_tasklistId)
      .concatMap(x =>
        TasklistModel.update(<string>_tasklistId, x)
      )
  }
}

export default new TasklistAPI
