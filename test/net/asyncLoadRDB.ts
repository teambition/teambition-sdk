import { expect } from 'chai'
import { describe, beforeEach, afterEach, it } from 'tman'
import { tap } from 'rxjs/operators'
import {
  createSdkWithoutRDB,
  loadRDB,
  SDK,
  TaskSchema,
  PostSchema,
  LikeSchema,
  SocketMock
} from '../index'
import { PostId, TaskId, UserId } from 'teambition-types'
import { projectPosts } from '../fixtures/posts.fixture'
import like from '../fixtures/like.fixture'
import userMe from '../fixtures/user.fixture'
import { task } from '../fixtures/tasks.fixture'
import * as myFixture from '../fixtures/my.fixture'
import { EventGenerator } from '../../src/apis/event/EventGenerator'

import { mock, restore, equals, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

describe('Async load reactivedb Spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let socket: SocketMock

  const userId = myFixture.myRecent[0]['_executorId'] as UserId

  beforeEach(() => {
    sdk = createSdkWithoutRDB()
    socket = new SocketMock(sdk.socketClient)
    mockResponse = mock(sdk)
  })

  afterEach(function* () {
    restore(sdk)
    if (sdk.database) {
      yield sdk.database.dispose()
    }
  })

  describe('No reactivedb request spec', () => {
    it('getPost should response correct data without reactivedb', function* () {
      const [fixture] = projectPosts

      mockResponse(fixture)
      yield sdk.getPost(fixture._id as PostId)
        .values()
        .pipe(tap(([r]) => {
          expect(r).to.deep.equal(fixture)
        }))

    })

    it('getLike should response correct data without reactivedb', done => {
      mockResponse(like)
      sdk.getLike('task', 'mocktask' as TaskId)
        .values()
        .subscribe(([r]) => {
          delete r._id
          expect(r).to.deep.equal(like)
          done()
        })
    })

    it('getUser should response correct data without reactivedb', function* () {
      mockResponse(userMe)

      yield sdk.getUserMe()
        .values()
        .pipe(tap(([user]) => {
          expect(user).to.deep.equal(userMe)
        }))
    })

    it('getTask should response correct data without reactivedb', function* () {
      const fixture = task
      mockResponse(fixture)
      yield sdk.getTask(fixture._id as TaskId)
        .values()
        .pipe(tap(([r]) => {
          expect(r).to.deep.equal(fixture)
        }))
    })
  })
  describe('ReactiveDB async load in', () => {

    it('getMyRecent should response correct data when reactivedb async load in', function* () {
      mockResponse(myFixture.myRecent)

      const result$ = sdk.getMyRecent(userId, {
        dueDate: '2017-02-13T03:38:54.252Z',
        startDate: '2016-12-31T16:00:00.000Z'
      }).values()

      yield loadRDB(sdk)
      yield result$
        .pipe(tap(r => {
          const compareFn = (x: any, y: any) => {
            return new Date(x.updated).valueOf() - new Date(y.updated).valueOf()
              + new Date(x.created).valueOf() - new Date(y.created).valueOf()
          }
          const expected = myFixture.norm(myFixture.myRecent).sort(compareFn)
          const actual = r.map(_r => {
            if (_r.type === 'task') {
              if (!(_r as TaskSchema).recurrence) {
                delete (_r as TaskSchema)._sourceId
                delete (_r as TaskSchema).recurrence
                delete (_r as TaskSchema).sourceDate
              }
              if (!(_r as TaskSchema).uniqueId) {
                delete (_r as TaskSchema).uniqueId
              }
            }
            if (_r instanceof EventGenerator) {
              return (_r as EventGenerator).next().value
            }
            return _r
          })
            .sort(compareFn)

          expected.forEach((expectedResult, i) => {
            expectToDeepEqualForFieldsOfTheExpected(actual[i], expectedResult)
          })
        }))
    })

    it('response cache should work when reactivedb async load in', function* () {
      const [fixture] = projectPosts

      mockResponse(fixture)
      yield sdk.getPost(fixture._id as PostId)
        .values()

      yield loadRDB(sdk)

      yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
        .values()
        .pipe(tap((r) => {
          expect(r.length).to.equal(1)
        }))
    })

    it('reactiveDb opearator should work when reactivedb load in', function* () {
      mockResponse({
        ...like, isLike: false, _id: 'mocktask:like'
      })

      yield sdk.getLike('task', 'mocktask' as TaskId)
        .values()

      yield sdk.toggleLike('task', 'mocktask' as TaskId, true)

      yield loadRDB(sdk)

      yield sdk.database.get<LikeSchema>('Like', {
        where: { _id: 'mocktask:like' }
      })
        .values()
        .pipe(tap(([r]) => {
          expect(r.isLike).to.be.false
        }))
    })

    describe('Socket spec when reactivedb async load in', () => {
      it('socket::destroy should work when reactivedb load in', function* () {
        const [ fixture ] = projectPosts

        mockResponse(fixture)

        yield sdk.getPost(fixture._id as PostId)
          .values()

        yield socket.emit('destroy', 'post', fixture._id)

        yield loadRDB(sdk)

        yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
          .values()
          .pipe(tap((r) => {
            expect(r.length).to.equal(0)
          }))
      })

      it('socket::change should work when reactivedb load in', function* () {
        const [fixture] = projectPosts

        mockResponse(fixture)
        yield sdk.getPost(fixture._id as PostId)
          .values()

        yield socket.emit('change', 'post', fixture._id, {
          // 这边不提供主键信息，以确定当 socket 消息的 d 部分不
          // 包含主键信息时，前端依然可以顺利操作。
          content: 'fixture'
        })

        yield loadRDB(sdk)

        yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
          .values()
          .pipe(tap(([r]) => expect(r.content).to.equal('fixture')))
      })

      it('socket::new should work when reactivedb load in', function* () {
        const [fixture] = projectPosts

        yield socket.emit('new', 'post', '', fixture)

        yield loadRDB(sdk)

        yield sdk.database.get('Post', { where: { _id: fixture._id } })
          .values()
          .pipe(tap((r) => equals(r, [fixture])))
      })
    })

  })
})
