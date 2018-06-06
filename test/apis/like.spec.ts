'use strict'
import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { createSdk, SDK, LikeSchema } from '../index'
import like from '../fixtures/like.fixture'
import { mock, restore } from '../utils'
import { DetailObjectId } from 'teambition-types'

describe('LikeApi request spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  const mockTaskId = 'mocktask' as DetailObjectId
  const mockTaskLikeId = 'mocktask:like'

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('get like should pass', function* () {
    mockResponse(like)

    yield sdk.getLike('task', mockTaskId)
      .values()
      .do(([r]) => {
        delete r._id
        expect(r).to.deep.equal(like)
      })
  })

  it('toggle like should pass', function* () {
    yield sdk.database.insert('Like', {
      ...like,
      _id: mockTaskLikeId
    })

    mockResponse({ ...like, isLike: false })

    yield sdk.toggleLike('task', mockTaskId, true)

    yield sdk.database.get<LikeSchema>('Like', {
      where: { _id: mockTaskLikeId }
    })
      .values()
      .do(([r]) => {
        expect(r.isLike).to.be.false
      })

    mockResponse({ ...like, isLike: true })

    yield sdk.toggleLike('task', mockTaskId, false)

    yield sdk.database.get<LikeSchema>('Like', {
      where: { _id: mockTaskLikeId }
    })
      .values()
      .do(([r]) => {
        expect(r.isLike).to.be.true
      })
  })
})
