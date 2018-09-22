import { Observable } from '../../rx'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { TaskSchema } from '../../schemas/Task'
import { TaskId } from 'teambition-types'

export function getTaskFetch(
  this: SDKFetch,
  taskId: TaskId,
  query?: any
): Observable<TaskSchema> {
  return this.get<TaskSchema>(`tasks/${taskId}`, query)
}

SDKFetch.prototype.getTask = getTaskFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    getTask: typeof getTaskFetch
  }
}

export function getTask(
  this: SDK,
  taskId: TaskId,
  query?: any
): QueryToken<TaskSchema> {
  return this.lift<TaskSchema>({
    cacheValidate: CacheStrategy.Cache,
    tableName: 'Task',
    request: this.fetch.getTask(taskId, query),
    query: {
      where: { _id: taskId }
    },
    assocFields: {
      executor: [ '_id', 'name', 'avatarUrl' ],
      stage: ['_id', 'name'],
      tasklist: ['_id', 'title'],
      parent: ['_id', 'content', '_creatorId', '_executorId', 'isDone']
    },
    excludeFields: ['project', 'isDeleted', 'source', 'subtaskIds', 'type', 'url']
  })
}

SDK.prototype.getTask = getTask

declare module '../../SDK' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDK {
    getTask: typeof getTask
  }
}
