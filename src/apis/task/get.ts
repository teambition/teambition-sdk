import { QueryToken } from 'reactivedb'
import { Http } from '../../Net'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { TaskSchema } from '../../schemas/Task'
import { TaskId } from 'teambition-types'

export function getTaskFetch(
  this: SDKFetch,
  taskId: TaskId,
  query?: any
): Http<TaskSchema> {
  return this.get<TaskSchema>(`events/${taskId}`, query)
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
      executor: [ '_id', 'name', 'avatarUrl' ],
      stage: ['_id', 'name'],
      tasklist: ['_id', 'title'],
      subtasks: [
        '_id', '_projectId', '_creatorId', 'content', 'isDone', '_executorId',
        '_taskId', 'dueDate', 'order', 'created', 'updated', {
          executor: [ '_id', 'name', 'avatarUrl' ]
        }
      ]
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
