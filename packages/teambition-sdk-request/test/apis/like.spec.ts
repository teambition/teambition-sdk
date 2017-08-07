'use strict'
import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDK, LikeSchema } from 'teambition-sdk-core'
import { LikeFixture as like, SocketMock } from 'teambition-sdk-testutil'
import { createSdk } from '../index'
import { mock, restore } from '../utils'

describe('LikeApi Spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('get like should pass', done => {
    mockResponse(like)

    sdk.getLike('task', 'mocktask')
      .values()
      .subscribe(([r]) => {
        delete r._id
        expect(r).to.deep.equal(like)
        done()
      })
  })

  it('toggle like should pass', function* () {
    yield sdk.database.insert('Like', {
      ...like,
      _id: 'mocktask:like'
    })

    mockResponse({ ...like, isLike: false })

    yield sdk.toggleLike('task', 'mocktask', true)

    yield sdk.database.get<LikeSchema>('Like', {
      where: { _id: 'mocktask:like' }
    })
      .values()
      .do(([r]) => {
        expect(r.isLike).to.be.false
      })

    mockResponse({ ...like, isLike: true })

    yield sdk.toggleLike('task', 'mocktask', false)

    yield sdk.database.get<LikeSchema>('Like', {
      where: { _id: 'mocktask:like' }
    })
      .values()
      .do(([r]) => {
        expect(r.isLike).to.be.true
      })

  })
})
