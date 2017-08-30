import { Observable } from 'rxjs/Observable'
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
      // ancestors: ['_id', 'content'],
      executor: [ '_id', 'name', 'avatarUrl' ],
      parent: ['_id', 'content', '_creatorId', '_executorId', 'isDone'],
      stage: ['_id', 'name'],
      tasklist: ['_id', 'title'],
      // subtasks: [
      //   '_id', '_projectId', '_creatorId', 'content', 'isDone', '_executorId',
      //   '_taskId', 'dueDate', 'order', 'created', 'updated',
      //   // ...subtaskFields,
      //   {
      //     executor: [ '_id', 'name', 'avatarUrl' ]
      //   }
      // ]
    },
    excludeFields: ['project', 'isDeleted', 'source', 'subtaskIds', 'type', 'url']
  })
}

SDK.prototype.getTask = getTask

declare module '../../SDK' {
  interface SDK {
    getTask: typeof getTask
  }
}
