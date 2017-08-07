## Event APIs

### Schema Definition
```ts
interface EventSchema {
  _id: EventId
  _creatorId: UserId
  attachmentsCount: number
  title: string
  creator: ExecutorOrCreator
  involvers: any
  content: string
  commentsCount: number
  location: string
  startDate: string
  endDate: string
  untilDate: string
  involveMembers: string []
  _projectId: ProjectId
  _sourceId: EventId
  sourceDate: string
  source: string
  shareStatus: number
  recurrence: string[]
  reminders: string[]
  isArchived: boolean
  visible: Visibility
  isDeleted: boolean
  created: string
  updated: string
  tagIds: TagId[]
  status: string
  isFavorite: boolean
  objectlinksCount: number
  likesCount: number
  project: {
    _id: ProjectId
    name: string
  }
  type: 'event'
  url: string
}
```

### EventGenerator

```ts
class EventGenerator implements IterableIterator<EventSchema>
```
#### EventGenerator#constructor

```ts
EventGenerator#constructor(event: EventSchema)
```

#### EventGenerator#next

获取下一个日程。如果是普通日程直接结束迭代，重复日程则会不停的往下生成下一个日程。

