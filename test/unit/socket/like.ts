'use strict'
import * as chai from 'chai'
import { Backend, SocketMock, LikeAPI, apihost, SocketClient } from '../index'
import { flush } from '../utils'
import { like } from '../../mock/like'

const expect = chai.expect

export default describe('like socket', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let LikeApi: LikeAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient)
    LikeApi = new LikeAPI()

    httpBackend.whenGET(`${apihost}tasks/mocktask/like?all=1`)
      .respond(JSON.stringify(like))
  })

  it('like change should ok', done => {
    const signal = LikeApi.getLike('task', <any>'mocktask')
      .publish()
      .refCount()

    signal.skip(1)
      .take(1)
      .subscribe(r => {
        expect(r.likesGroup.length).to.equal(like.likesGroup.length + 1)
        done()
      })

    Socket.emit('change', 'task', 'mocktask', {
      likesCount: like.likesCount + 1,
      isLike: true,
      likesGroup: like.likesGroup.concat({
        _id: 'mockmember',
        name: 'mockmember',
        avatarUrl: 'url'
      })
    }, signal.take(1))
  })

})
