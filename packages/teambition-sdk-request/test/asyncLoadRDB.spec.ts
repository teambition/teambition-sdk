import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { Subscription } from 'rxjs'
import { SDK, TaskSchema, PostSchema, LikeSchema } from 'teambition-sdk-core'
import {
  SocketMock,
  LikeFixture as like,
  MyFixture,
  PostsFixture,
  TasksFixture,
  UserFixture as userMe,
} from 'teambition-sdk-testutil'

import { mock, restore, equals } from './utils'
import { createSdkWithoutRDB, loadRDB, normIfRecurrentEvent, EventGenerator } from './index'

describe('Async load reactivedb Spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let socket: SocketMock

  const userId = MyFixture.myRecent[0]['_executorId']

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
      const [fixture] = PostsFixture.projectPosts

      mockResponse(fixture)
      yield sdk.getPost(fixture._id)
        .values()
        .do(([r]) => {
          expect(r).to.deep.equal(fixture)
        })

    })

    it('getLike should response correct data without reactivedb', done => {
      mockResponse(like)
      sdk.getLike('task', 'mocktask')
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
        .do(([user]) => {
          expect(user).to.deep.equal(userMe)
        })
    })

    it('getTask should response correct data without reactivedb', function* () {
      const fixture = TasksFixture.task
      mockResponse(fixture)
      yield sdk.getTask(fixture._id)
        .values()
        .do(([r]) => {
          expect(r).to.deep.equal(fixture)
        })
    })
  })
  describe('ReactiveDB async load in', () => {

    it('getMyRecent should response correct data when reactivedb async load in', done => {
      mockResponse(MyFixture.myRecent)

      const token = sdk.getMyRecent(userId, {
        dueDate: '2017-02-13T03:38:54.252Z',
        startDate: '2016-12-31T16:00:00.000Z'
      })

      let subscription: Subscription

      token.values()
        .subscribe(r => {
          const compareFn = (x: any, y: any) => {
            return new Date(x.updated).valueOf() - new Date(y.updated).valueOf()
              + new Date(x.created).valueOf() - new Date(y.created).valueOf()
          }
          const expected = normIfRecurrentEvent(MyFixture.myRecent).sort(compareFn)
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
              return _r.next().value
            }
            return _r
          })
            .sort(compareFn)
          expect(actual).to.deep.equal(expected)
          subscription.unsubscribe()
          done()
        })

       subscription = loadRDB(sdk).subscribe()
    })

    it('response cache should work when reactivedb async load in', function* () {
      const [fixture] = PostsFixture.projectPosts

      mockResponse(fixture)
      yield sdk.getPost(fixture._id)
        .values()

      yield loadRDB(sdk)

      yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
        .values()
        .do((r) => {
          expect(r.length).to.equal(1)
        })
    })

    it('reactiveDb opearator should work when reactivedb load in', function* () {
      mockResponse({
        ...like, isLike: false, _id: 'mocktask:like'
      })

      yield sdk.getLike('task', 'mocktask')
        .values()

      yield sdk.toggleLike('task', 'mocktask', true)

      yield loadRDB(sdk)

      yield sdk.database.get<LikeSchema>('Like', {
        where: { _id: 'mocktask:like' }
      })
        .values()
        .do(([r]) => {
          expect(r.isLike).to.be.false
        })
    })

    describe('Socket spec when reactivedb async load in', () => {
      it('socket::destroy should work when reactivedb load in', function* () {
        const [ fixture ] = PostsFixture.projectPosts

        mockResponse(fixture)

        yield sdk.getPost(fixture._id)
          .values()

        yield socket.emit('destroy', 'post', fixture._id)

        yield loadRDB(sdk)

        yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
          .values()
          .do((r) => {
            expect(r.length).to.equal(0)
          })
      })

      it('socket::change should work when reactivedb load in', function* () {
        const [fixture] = PostsFixture.projectPosts

        mockResponse(fixture)
        yield sdk.getPost(fixture._id)
          .values()

        yield socket.emit('change', 'post', fixture._id, {
          // 这边不提供主键信息，以确定当 socket 消息的 d 部分不
          // 包含主键信息时，前端依然可以顺利操作。
          content: 'fixture'
        })

        yield loadRDB(sdk)

        yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
          .values()
          .do(([r]) => expect(r.content).to.equal('fixture'))
      })

      it('socket::new should work when reactivedb load in', function* () {
        const [fixture] = PostsFixture.projectPosts

        yield socket.emit('new', 'post', '', fixture)

        yield loadRDB(sdk)

        yield sdk.database.get('Post', { where: { _id: fixture._id } })
          .values()
          .do((r) => equals(r, [fixture]))
      })
    })

  })
})
