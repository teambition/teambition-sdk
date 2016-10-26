'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import {
  Backend,
  MessageAPI,
  apihost,
  forEach,
  BaseFetch
} from '../index'
import { flush, notInclude } from '../utils'
import { messages } from '../../mock/messages'

const expect = chai.expect

export default describe('MessageAPI test: ', () => {
  let httpBackend: Backend
  let Message: MessageAPI
  let spy: Sinon.SinonSpy

  const _messageId = messages[0]._id
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
    Message = new MessageAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get messages test: ', () => {
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}v2/messages?type=normal&sort=normal&count=10&page=1`)
        .respond(JSON.stringify(messages))
    })

    it('get messages should ok', done => {
      Message.getMessages(<any>getMessagesQuery)
        .subscribe(data => {
          forEach(data, (message, index) => {
            ['_id', 'name', 'logo'].forEach(k => {
              expect(messages[index][k]).to.equal(message[k])
            })
          })
          done()
        })
    })

    it('get messages from cache should ok', function* () {
      yield Message.getMessages(<any>getMessagesQuery)
        .take(1)

      Message.getMessages(<any>getMessagesQuery)
        .do(results => {
          forEach(results, (message, index) => {
            ['_id', 'name', 'logo'].forEach(k => {
              expect(messages[index][k]).to.equal(message[k])
            })
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('read a message should ok', function* () {
      const mockResponse = {
        isRead: true,
        unreadActivitiesCount: 0,
        updated: new Date().toISOString()
      }

      httpBackend.whenPUT(`${apihost}messages/${_messageId}`, {
        isRead: true,
        unreadActivitiesCount: 0
      })
        .respond(JSON.stringify(mockResponse))

      yield Message.getMessages(<any>getMessagesQuery)
        .take(1)

      yield Message.read(<any>_messageId)

      yield Message.getMessages(<any>getMessagesQuery)
        .take(1)
        .do(data => {
          expect(data[0].isRead).to.equal(mockResponse.isRead)
        })
    })

    it('mark all messages as read should ok', function* () {
      httpBackend.whenPUT(`${apihost}messages/markallread`, {
        type: _messageType
      })
        .respond(JSON.stringify({}))

      const signal = Message.getMessages(<any>getMessagesQuery)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Message.markAllAsRead(<any>_messageType)

      yield signal.take(1)
        .do(messages => {
          forEach(messages, message => {
            expect(message.isRead).to.be.true
          })
        })
    })

    it('snooze a message should ok', function* () {
      const reminderDate = '3016-07-27T18:23:43+08:00'
      const mockResponse = {
        _id: _messageId,
        isLater: true,
        updated: new Date().toISOString(),
        reminder: {
          updated: new Date().toISOString(),
          reminderDate: reminderDate
        },
        msgType: 'later'
      }
      httpBackend.whenPUT(`${apihost}messages/${_messageId}/later`, {
        isLater: true,
        reminderDate: reminderDate
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Message.getMessages(<any>getMessagesQuery)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Message.snooze(<any>_messageId, reminderDate)
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(results => {
          notInclude(messages, messages[0])
          expect(results.length).to.equal(messages.length - 1)
        })
    })

    it('delete all messages should ok', function* () {
      httpBackend.whenDELETE(`${apihost}messages?type=${_messageType}`)
        .respond(JSON.stringify({}))

      const signal = Message.getMessages(<any>getMessagesQuery)
        .publish()
        .refCount()

      yield signal.take(1)

      signal.skip(1)
        .subscribe(messages => {
          expect(messages.length).to.equal(0)
        })

      yield Message.deleteAllRead(<any>_messageType)
    })

    it('delete a message should ok', function* () {
      httpBackend.whenDELETE(`${apihost}messages/${_messageId}`)
        .respond(JSON.stringify({}))

      const signal = Message.getMessages(<any>getMessagesQuery)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Message.delete(<any>_messageId)

      yield signal.take(1)
        .do(results => {
          notInclude(messages, messages[0])
          expect(results.length).to.equal(messages.length - 1)
        })
    })

  })
})
