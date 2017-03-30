import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { TaskSchema, EventSchema, SubtaskSchema } from '../../schemas'
import { UserId } from 'teambition-types'
import { EventGenerator } from '../event/EventGenerator'

export interface RecentTaskData extends TaskSchema {
  type: 'task'
}

export interface RecentEventData extends EventSchema {
  type: 'event'
}

export interface RecentSubtaskData extends SubtaskSchema {
  type: 'subtask'
}

export interface MyRecentQuery {
  dueDate: string
  startDate?: string
}

export type RecentData = RecentEventData | RecentSubtaskData | RecentTaskData

export type RecentResult = EventGenerator | RecentSubtaskData | RecentTaskData

export function getMyRecentFetch(
  this: SDKFetch,
  query: MyRecentQuery
): Observable<RecentData[]> {
  return this.get<RecentData[]>(`users/recent`, query)
}

SDKFetch.prototype.getMyRecent = getMyRecentFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getMyRecent: typeof getMyRecentFetch
  }
}

export function getMyRecent(
  this: SDK,
  userId: UserId,
  query: MyRecentQuery
): QueryToken<RecentResult> {
  const request = this.fetch.getMyRecent(query)
    .publishReplay(1)
    .refCount()
  const dueDate = new Date(query.dueDate).valueOf()
  let taskToken = this.lift<RecentData>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Task',
    request: request.map(v => v.filter(t => t.type === 'task')),
    query: {
      where: {
        dueDate: {
          $lte: dueDate
        },
        isDone: false,
        _executorId: userId,
        $or: [
          {
            isArchived: null
          }, {
            isArchived: false
          }
        ],
      }
    },
    assocFields: {
      project: [ '_id', 'isArchived', 'name' ]
    },
    excludeFields: [
      'subtask', 'executor', 'stage', 'tasklist', 'attachmentsCount',
      'commentsCount', 'involvers', 'likesCount', 'shareStatus', 'subtaskCount'
    ]
  })

  taskToken = taskToken.map((task: TaskSchema) => {
    task.type = 'task'
    return task
  })

  const eventQuery = {
    where: {
      $or: {
        endDate: {
          $lte: dueDate
        },
        recurrence: {
          $isNotNull: true
        }
      },
      involveMembers: {
        $has: userId
      },
      $and: {
        $or: [
          {
            isArchived: false
          },
          {
            isArchived: null
          }
        ]
      }
    }
  }
  if (query.startDate) {
    (eventQuery.where.$or as any).startDate = {
      $gte: new Date(query.startDate).valueOf()
    }
  }

  let eventToken: QueryToken<any>= this.lift<RecentData>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Event',
    request: request.map(v => v.filter(t => t.type === 'event')),
    query: eventQuery,
    assocFields: {
      project: ['_id', 'name', 'isArchived']
    },
    excludeFields: [
      'attachmentsCount',
      'commentsCount',
      'involvers',
      'likesCount',
      'shareStatus',
      'source',
      'status',
      'untilDate'
    ]
  })

  eventToken = eventToken.map((e: EventSchema) => new EventGenerator(e))

  let subtaskToken = this.lift<RecentData>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Subtask',
    request: request.map(v => v.filter(s => s.type === 'subtask')),
    query: {
      where: {
        _executorId: userId,
        dueDate: {
          $lte: dueDate
        }
      }
    },
    assocFields: {
      project: ['_id', 'name', 'isArchived'],
      task: ['_id', 'content']
    },
    excludeFields: [ 'order' ]
  })

  subtaskToken = subtaskToken.map((subtask: SubtaskSchema) => {
    subtask.type = 'subtask'
    return subtask
  })

  return <any>taskToken.combine(eventToken, subtaskToken)
}

SDK.prototype.getMyRecent = getMyRecent

declare module '../../SDK' {
  interface SDK {
    getMyRecent: typeof getMyRecent
  }
}
