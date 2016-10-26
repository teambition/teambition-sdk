'use strict'
import * as chai from 'chai'
import { apihost, MessageAPI, SocketMock, SocketClient, Backend, clone, uuid } from '../index'
import { flush } from '../utils'
import { messages } from '../../mock/messages'

const expect = chai.expect

export default describe('socket message test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let MessageApi: MessageAPI
  const mockMessages = clone(messages)
  const _messageType = 'normal'
  const getMessagesQuery: any = {
    type: _messageType,
    sort: 'normal',
    count: 10,
    page: 1
  }

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient)
    MessageApi = new MessageAPI()

    httpBackend.whenGET(`${apihost}v2/messages?type=normal&sort=normal&count=10&page=1`)
      .respond(JSON.stringify(mockMessages))
  })

  it('add a new message should ok', function* () {
    const mockMessage = clone(messages[0])
    mockMessage._id = uuid()

    const signal = MessageApi.getMessages(getMessagesQuery)
      .publish()
      .refCount()

    yield Socket.emit('new', 'message', '', mockMessage, signal.take(1))

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(mockMessages.length + 1)
      })
  })

  it('read a message should ok', function* () {
    const signal = MessageApi.getMessages(getMessagesQuery)
      .publish()
      .refCount()

    yield Socket.emit('change', 'message', mockMessages[0]._id, {
      isRead: true
    }, signal.take(1))

    yield signal.take(1)
      .do(data => {
        expect(data[0].isRead).to.be.true
      })
  })

  it('snooze a message should ok', function* () {
    const signal = MessageApi.getMessages(getMessagesQuery)

    yield Socket.emit('change', 'message', mockMessages[0]._id, {
      isLater: true
    }, signal.take(1))

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(mockMessages.length - 1)
      })
  })
})
