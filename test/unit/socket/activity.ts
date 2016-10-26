'use strict'
import * as chai from 'chai'
import { apihost, ActivityAPI, Backend, SocketMock, SocketClient } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { activities } from '../../mock/activities'

const expect = chai.expect

export default describe('activity socket test', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let ActivityApi: ActivityAPI

  const _boundToObjectId = activities[0]._boundToObjectId
  const _boundToObjectType: any = 'tasks'

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient)
    ActivityApi = new ActivityAPI()

    httpBackend.whenGET(`${apihost}${_boundToObjectType}/${_boundToObjectId}/activities`)
      .respond(JSON.stringify(activities))
  })

  it('new acitvity should ok', function* () {
    const mockActivity = {
      '_creatorId': '56faa6e8bf84dfd30c4a9c1e',
      'rootId': 'project#5791a57c309ba9e45a45917c',
      'action': 'activity.task.subtask.create.one',
      'content': {
        'subtask': '333333',
        'count': 1,
        'creator': '陈光辉'
      },
      '_id': '5796c802309ba9e45a45a9da',
      'created': '2016-07-26T02:16:34.103Z',
      '_boundToObjectId': _boundToObjectId,
      'boundToObjectType': 'task',
      'rawAction': 'add_task_subtasks',
      'creator': {
        '_id': '56faa6e8bf84dfd30c4a9c1e',
        'name': '陈光辉',
        'avatarUrl': 'https://striker.teambition.net/thumbnail/110f3ee59313662e340885af313f0c780bd1/w/100/h/100'
      },
      'locales': {
        'zh': {
          'title': '陈光辉 添加了子任务\'333333\''
        },
        'en': {
          'title': '陈光辉 added the subtask \'333333\''
        },
        'ko': {
          'title': '陈光辉 added the subtask \'333333\''
        },
        'ja': {
          'title': '陈光辉 added the subtask \'333333\''
        },
        'zh_tw': {
          'title': '陈光辉 添加了子任务\'333333\''
        }
      },
      'title': '陈光辉 添加了子任务\'333333\''
    }

    const signal = ActivityApi.getActivities(_boundToObjectType, _boundToObjectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Socket.emit('new', 'activity', '', mockActivity, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(activities.length + 1)
        expectDeepEqual(r[0], mockActivity)
      })
  })

  it('new comment should ok', function* () {
    const mockComment = {
      'action': 'activity.comment',
      '_creatorId': '56faa6e8bf84dfd30c4a9c1e',
      'rootId': 'project#5791a57c309ba9e45a45917c',
      'content': {
        'comment': '222',
        'attachments': [],
        'mentionsArray': [],
        'mentions': {},
        'attachmentsName': '',
        'creator': '陈光辉'
      },
      '_id': '5796cb25309ba9e45a45aa3f',
      'created': '2016-07-26T02:29:57.349Z',
      '_boundToObjectId': _boundToObjectId,
      'boundToObjectType': 'task',
      'rawAction': 'comment',
      'creator': {
        '_id': '56faa6e8bf84dfd30c4a9c1e',
        'name': '陈光辉',
        'avatarUrl': 'https://striker.teambition.net/thumbnail/110f3ee59313662e340885af313f0c780bd1/w/100/h/100'
      },
      'locales': {
        'zh': {
          'title': '陈光辉: 222'
        },
        'en': {
          'title': '陈光辉: 222'
        },
        'ko': {
          'title': '陈光辉: 222'
        },
        'ja': {
          'title': '陈光辉: 222'
        },
        'zh_tw': {
          'title': '陈光辉: 222'
        }
      },
      'title': '陈光辉: 222'
    }

    const signal = ActivityApi.getActivities(_boundToObjectType, _boundToObjectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Socket.emit('new', 'activity', '', mockComment, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(activities.length + 1)
        expectDeepEqual(r[0], mockComment)
      })
  })
})
