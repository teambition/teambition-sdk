import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { TaskData, EventData, SubtaskData } from '../../schemas'
import { UserId } from 'teambition-types'

export interface RecentTaskData extends TaskData {
  type: 'task'
}

export interface RecentEventData extends EventData {
  type: 'event'
}

export interface RecentSubtaskData extends SubtaskData {
  type: 'subtask'
}

export interface MyRecentQuery {
  dueDate: string
  startDate?: string
}

export type RecentData = RecentEventData | RecentSubtaskData | RecentTaskData

export function getMyRecentFetch(
  this: SDKFetch,
  query: MyRecentQuery
): Observable<RecentData[]> {
  return this.get<RecentData[]>(`/users/recent`, query)
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
): QueryToken<RecentData> {
  const request = this.fetch.getMyRecent(query)
    .publishReplay(1)
    .refCount()
  const dueDate = new Date(query.dueDate).valueOf()
  const taskToken = this.lift<RecentData>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Task',
    request: request.map(v => v.filter(t => t.type === 'task')),
    query: {
      where: {
        dueDate: {
          $lte: dueDate
        },
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

  const eventToken = this.lift<RecentData>({
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

  const subtaskToken = this.lift<RecentData>({
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
  return taskToken.combine(eventToken, subtaskToken)
}

SDK.prototype.getMyRecent = getMyRecent

declare module '../../SDK' {
  interface SDK {
    getMyRecent: typeof getMyRecent
  }
}
