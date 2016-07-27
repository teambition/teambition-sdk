'use strict'
import * as chai from 'chai'
import { apihost, MessageAPI, SocketMock, Backend, clone } from '../index'
import { flush } from '../utils'
import { messages } from '../../mock/messages'

const expect = chai.expect

export default describe('socket message test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let MessageApi: MessageAPI
  const mockMessages = clone(messages)
  const _messageType = 'normal'
  const getMessagesQuery = {
    type: _messageType,
    sort: 'normal',
    count: 10,
    page: 1
  }

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    MessageApi = new MessageAPI()

    httpBackend.whenGET(`${apihost}messages?type=normal&sort=normal&count=10&page=1`)
      .respond(JSON.stringify(mockMessages))
  })

  it('add a new message should ok', done => {
    const mockMessage = {
      _id: '57987950bf83e5868ea6052b',
      _userId: '53ee3018caf6a0e8270de0f7',
      type: 'object',
      updated: '2016-07-27T10:23:41.164Z',
      isArchived: false,
      isMute: false,
      isAted: false,
      reminder: {
        reminderDate: '2016-07-27T10:23:43.000Z',
        updated: '2016-07-27T09:23:43.213Z'
      },
      isLater: false,
      isRead: false,
      unreadActivitiesCount: 1,
      boundToObjectUpdated: '2016-07-27T09:05:20.546Z',
      creator: {
        _id: '54cb6200d1b4c6af47abe570',
        name: '龙逸楠',
        avatarUrl: 'https://striker.teambition.net/thumbnail/110f238c339c7dacefbc792723a067fbf188/w/200/h/200'
      },
      title: 'go',
      mentions: { },
      _latestActivityId: '579879505b47ec824502c992',
      subtitle: 'web2 review',
      _projectId: '56fe95cb7ddf9b170a3934b6',
      project: {
        name: 'T-Plan',
        logo: 'https://striker.teambition.net/thumbnail/110fca43c489e148d2d3de59d54b76dd2d81/w/600/h/200',
        _id: '56fe95cb7ddf9b170a3934b6'
      },
      _objectId: '579879505b47ec824502c98f',
      objectType: 'event'
    }

    MessageApi.getMessages(getMessagesQuery)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(mockMessages.length + 1)
        done()
      })

    Socket.emit('new', 'message', mockMessages[0]._id, mockMessage)

    httpBackend.flush()
  })

  it('read a message should ok', done => {
    MessageApi.getMessages(getMessagesQuery)
      .skip(1)
      .subscribe(data => {
        expect(data[0].isRead).to.be.true
        done()
      })

    Socket.emit('change', 'message', mockMessages[0]._id, {
      isRead: true
    })

    httpBackend.flush()
  })

  it('snooze a message should ok', done => {
    MessageApi.getMessages(getMessagesQuery)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(mockMessages.length - 1)
        done()
      })

    Socket.emit('change', 'message', mockMessages[0]._id, {
      isLater: true
    })

    httpBackend.flush()
  })
})
