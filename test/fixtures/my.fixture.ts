import { EventSchema } from '../index'
import { EventGenerator } from '../../src/apis/event/EventGenerator'

export function norm(myRecent: any[]): any[] {
  const transFns: any[] = [firstOfARecurrentEvent]
  return myRecent.map((x) => transFns.reduce((y, f) => f(y), x))
}

function firstOfARecurrentEvent(recent: any): any | EventSchema {
  if (!recent.recurrence || !recent.recurrence.length || recent.type === 'task') {
    return recent
  }
  const egen = new EventGenerator(recent)
  return egen.next().value
}

export const myRecent = [
  {
    _id: '59294fb91aabde185741fefe',
    _tasklistId: '59294fb5b7f2661851cd1d2a',
    _executorId: '55dd7dbc19aa03ba6e2db472',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    _projectId: '59294fb41aabde185741fed8',
    pos: 65536,
    ancestorIds: [],
    reminder: {
      members: [],
      date: null,
      type: 'unset'
    },
    customfields: [],
    tagIds: [],
    _stageId: '59294fb5b7f2661851cd1d2b',
    visible: 'members',
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    updated: '2017-05-27T10:07:35.113Z',
    created: '2017-05-27T10:06:49.912Z',
    isArchived: null,
    isDeleted: false,
    isDone: false,
    source: 'teambition',
    priority: 0,
    dueDate: '2017-05-04T10:00:00.000Z',
    startDate: null,
    accomplished: null,
    note: '',
    content: '1',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/tasks/scrum/59294fb5b7f2661851cd1d2a/task/59294fb91aabde185741fefe',
    type: 'task',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: {
      _id: '55dd7dbc19aa03ba6e2db472',
      name: 'kaka3',
      avatarUrl: 'https://striker.teambition.net/thumbnail/110793711511b4aeb3b1ff63b4d64328e7df/w/100/h/100'
    },
    parent: null,
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 0,
      done: 0
    }
  },
  {
    _id: '59294fbbb7f2661851cd1d3f',
    _tasklistId: '59294fb5b7f2661851cd1d2a',
    _executorId: '55dd7dbc19aa03ba6e2db472',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    _projectId: '59294fb41aabde185741fed8',
    pos: 65536,
    ancestorIds: [],
    reminder: {
      members: [],
      date: null,
      type: 'unset'
    },
    customfields: [],
    tagIds: [
      '59294fca1aabde1857420038'
    ],
    _stageId: '59294fb5b7f2661851cd1d2c',
    visible: 'members',
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    updated: '2017-05-27T10:07:27.432Z',
    created: '2017-05-27T10:06:51.592Z',
    isArchived: null,
    isDeleted: false,
    isDone: false,
    source: 'teambition',
    priority: 1,
    dueDate: '2017-05-04T10:00:00.000Z',
    startDate: null,
    accomplished: null,
    note: 'lll',
    content: '2',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/tasks/scrum/59294fb5b7f2661851cd1d2a/task/59294fbbb7f2661851cd1d3f',
    type: 'task',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: {
      _id: '55dd7dbc19aa03ba6e2db472',
      name: 'kaka3',
      avatarUrl: 'https://striker.teambition.net/thumbnail/110793711511b4aeb3b1ff63b4d64328e7df/w/100/h/100'
    },
    parent: null,
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 2,
      done: 0
    }
  },
  {
    _id: '59294fbd1aabde185741ff0a',
    _tasklistId: '59294fb5b7f2661851cd1d2a',
    _executorId: '55dd7dbc19aa03ba6e2db472',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    _projectId: '59294fb41aabde185741fed8',
    pos: 65536,
    ancestorIds: [],
    reminder: {
      members: [],
      date: null,
      type: 'unset'
    },
    customfields: [],
    tagIds: [],
    _stageId: '59294fb5b7f2661851cd1d2d',
    visible: 'members',
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    updated: '2017-05-27T10:07:31.549Z',
    created: '2017-05-27T10:06:53.700Z',
    isArchived: null,
    isDeleted: false,
    isDone: false,
    source: 'teambition',
    priority: 0,
    dueDate: '2017-05-04T10:00:00.000Z',
    startDate: null,
    accomplished: null,
    note: '',
    content: '3',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/tasks/scrum/59294fb5b7f2661851cd1d2a/task/59294fbd1aabde185741ff0a',
    type: 'task',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: {
      _id: '55dd7dbc19aa03ba6e2db472',
      name: 'kaka3',
      avatarUrl: 'https://striker.teambition.net/thumbnail/110793711511b4aeb3b1ff63b4d64328e7df/w/100/h/100'
    },
    parent: null,
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 0,
      done: 0
    }
  },
  {
    _id: '59294fceb7f2661851cd1f4f',
    _tasklistId: '59294fb5b7f2661851cd1d2a',
    _executorId: '55dd7dbc19aa03ba6e2db472',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    _projectId: '59294fb41aabde185741fed8',
    pos: 65536,
    ancestorIds: [
      '59294fbbb7f2661851cd1d3f'
    ],
    reminder: {
      members: [],
      date: null,
      type: 'unset'
    },
    customfields: [],
    tagIds: [],
    _stageId: '59294fb5b7f2661851cd1d2c',
    visible: 'members',
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    updated: '2017-05-27T10:07:22.450Z',
    created: '2017-05-27T10:07:10.827Z',
    isArchived: null,
    isDeleted: false,
    isDone: false,
    source: 'teambition',
    priority: 0,
    dueDate: '2017-05-10T10:00:00.000Z',
    startDate: null,
    accomplished: null,
    note: '',
    content: '4',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/tasks/scrum/59294fb5b7f2661851cd1d2a/task/59294fceb7f2661851cd1f4f',
    type: 'task',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: {
      _id: '55dd7dbc19aa03ba6e2db472',
      name: 'kaka3',
      avatarUrl: 'https://striker.teambition.net/thumbnail/110793711511b4aeb3b1ff63b4d64328e7df/w/100/h/100'
    },
    parent: {
      _id: '59294fbbb7f2661851cd1d3f',
      content: '2',
      _creatorId: '55dd7dbc19aa03ba6e2db472',
      _executorId: '55dd7dbc19aa03ba6e2db472',
      isDone: false
    },
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 1,
      done: 0
    }
  },
  {
    _id: '59294feeb7f2661851cd1fc9',
    _tasklistId: '59294fb5b7f2661851cd1d2a',
    _executorId: '55dd7dbc19aa03ba6e2db472',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    _projectId: '59294fb41aabde185741fed8',
    pos: 131072,
    ancestorIds: [
      '59294fbbb7f2661851cd1d3f'
    ],
    reminder: {
      members: [],
      date: null,
      type: 'unset'
    },
    customfields: [],
    tagIds: [],
    _stageId: '59294fb5b7f2661851cd1d2c',
    visible: 'members',
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    updated: '2017-05-27T10:07:47.904Z',
    created: '2017-05-27T10:07:42.201Z',
    isArchived: null,
    isDeleted: false,
    isDone: false,
    source: 'teambition',
    priority: 0,
    dueDate: '2017-05-01T10:00:00.000Z',
    startDate: null,
    accomplished: null,
    note: '',
    content: '222',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/tasks/scrum/59294fb5b7f2661851cd1d2a/task/59294feeb7f2661851cd1fc9',
    type: 'task',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: {
      _id: '55dd7dbc19aa03ba6e2db472',
      name: 'kaka3',
      avatarUrl: 'https://striker.teambition.net/thumbnail/110793711511b4aeb3b1ff63b4d64328e7df/w/100/h/100'
    },
    parent: {
      _id: '59294fbbb7f2661851cd1d3f',
      content: '2',
      _creatorId: '55dd7dbc19aa03ba6e2db472',
      _executorId: '55dd7dbc19aa03ba6e2db472',
      isDone: false
    },
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 0,
      done: 0
    }
  },
  {
    _id: '592950101aabde18574200fa',
    sourceDate: '2017-05-27T10:00:00.000Z',
    _sourceId: '592950101aabde18574200fa',
    startDate: '2017-05-27T10:00:00.000Z',
    endDate: '2017-05-27T11:00:00.000Z',
    recurrence: [
      'RRULE:FREQ=DAILY;DTSTART=20170527T100000Z;INTERVAL=1'
    ],
    _projectId: '59294fb41aabde185741fed8',
    _creatorId: '55dd7dbc19aa03ba6e2db472',
    tagIds: [],
    updated: '2017-05-27T10:08:16.892Z',
    created: '2017-05-27T10:08:16.892Z',
    isDeleted: false,
    visible: 'members',
    isArchived: null,
    reminders: [],
    involveMembers: [
      '55dd7dbc19aa03ba6e2db472'
    ],
    location: '',
    content: '',
    title: 'xxx',
    url: 'http://project.ci/project/59294fb41aabde185741fed8/events/event/592950101aabde18574200fa',
    type: 'event',
    project: {
      _id: '59294fb41aabde185741fed8',
      name: '2222',
      isArchived: false
    },
    executor: null,
    parent: null,
    objectlinksCount: 0,
    isFavorite: false,
    subtaskCount: {
      total: 0,
      done: 0
    }
  }
]
  .map(r => {
    if (r.type === 'task') {
      delete (r as any).subtaskIds
      if (r.parent) {
        (r as any)._taskId = r.parent._id
      } else {
        (r as any)._taskId = null
      }
    }
    if ((r as any).attachments) {
      delete (r as any).attachments
    }
    if (r.type === 'event') {
      delete (r as any).untilDate
      delete (r as any).executor
      delete (r as any).subtaskCount
      delete (r as any).parent
    }
    return r
  })

export const count = {
  organizationsCount: 1,
  notesCount: 20,
  reportCount: 10,
  favoritesCount: 30,
  tasksCount: 160,
  subtasksCount: 19
}
