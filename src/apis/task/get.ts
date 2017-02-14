import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'
import { TaskData } from '../../schemas/Task'
import { TaskId } from 'teambition-types'

export function getTaskFetch(
  this: SDKFetch,
  taskId: TaskId,
  query?: any
): Observable<TaskData> {
  return this.get<TaskData>(`/events/${taskId}`, query)
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
): QueryToken<TaskData> {
  return this.lift<TaskData>({
    cacheValidate: 'cache',
    tableName: 'Task',
    request: this.fetch.getTask(taskId, query),
    query: {
      where: { _id: taskId }
    },
    assoFields: {
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
