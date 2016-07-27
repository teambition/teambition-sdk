'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import { Scheduler } from 'rxjs'
import {
  Backend,
  MessageAPI,
  apihost,
  forEach,
  BaseFetch
} from '../index'
import { flush, expectDeepEqual, notInclude } from '../utils'
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
      httpBackend.whenGET(`${apihost}messages?type=normal&sort=normal&count=10&page=1`)
        .respond(JSON.stringify(messages))
    })

    it('get messages should ok', done => {
      Message.getMessages(getMessagesQuery)
        .subscribe(data => {
          forEach(data, (message, index) => {
            expectDeepEqual(message, messages[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get messages from cache should ok', done => {
      Message.getMessages(getMessagesQuery).subscribe()

      Message.getMessages(getMessagesQuery)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(results => {
          forEach(results, (message, index) => {
            expectDeepEqual(message, messages[index])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('read a message should ok', done => {
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

      Message.getMessages(getMessagesQuery).subscribe()

      Message.read(_messageId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          expect(data).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('mark all messages as read should ok', done => {
      httpBackend.whenPUT(`${apihost}messages/markallread`, {
        type: _messageType
      })
        .respond(JSON.stringify({}))

      Message.getMessages(getMessagesQuery)
        .skip(1)
        .subscribe(messages => {
          forEach(messages, message => {
            expect(message.isRead).to.be.true
          })
          done()
        })

      Message.markAllAsRead(_messageType)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('snooze a message should ok', done => {
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

      Message.getMessages(getMessagesQuery)
        .skip(1)
        .subscribe(results => {
          notInclude(messages, messages[0])
          expect(results.length).to.equal(messages.length - 1)
        })

      Message.snooze(_messageId, reminderDate)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('delete all messages should ok', done => {
      httpBackend.whenDELETE(`${apihost}messages?type=${_messageType}`)
        .respond(JSON.stringify({}))

      Message.getMessages(getMessagesQuery)
        .skip(1)
        .subscribe(messages => {
          expect(messages.length).to.equal(0)
          done()
        })

      Message.deleteAllRead(_messageType)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete a message should ok', done => {
      httpBackend.whenDELETE(`${apihost}messages/${_messageId}`)
        .respond(JSON.stringify({}))

      Message.getMessages(getMessagesQuery)
        .skip(1)
        .subscribe(results => {
          notInclude(messages, messages[0])
          expect(results.length).to.equal(messages.length - 1)
          done()
        })

      Message.delete(_messageId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })
})
