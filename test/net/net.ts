import { Subscription, Scheduler } from 'rxjs'
import { describe, beforeEach, afterEach, it } from 'tman'
import { Database, DataStoreType } from 'reactivedb'
import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as SinonChai from 'sinon-chai'
import '../../src/schemas'
import { schemas, CacheStrategy } from '../../src/SDK'
import { Net, Backend, SDKFetch, forEach, uuid, Http, EventSchema } from '..'
import { ApiResult } from '../../src/Net/Net'
import { normalEvent, projectEvents } from '../fixtures/events.fixture'

import { expectToDeepEqualForFieldsOfTheExpected } from '../utils'

use(SinonChai)

describe('Net test', () => {
  let net: Net
  let httpBackend: Backend
  let database: Database
  let version = 1
  let subscription: Subscription | undefined
  let spyFetch: sinon.SinonSpy

  const sdkFetch = new SDKFetch()
  const apiHost = sdkFetch.getAPIHost()
  const path = 'test'
  const http = new Http(`${apiHost}/${path}`)

  beforeEach(() => {
    httpBackend = new Backend()
    net = new Net(schemas)
    database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', version++)
    net.persist(database)
    forEach(schemas, d => {
      database.defineSchema(d.name, d.schema)
    })
    database.connect()
  })

  afterEach(function* () {
    httpBackend.restore()
    spyFetch && spyFetch.restore()
    if (subscription instanceof Subscription) {
      subscription.unsubscribe()
    }
    yield database.dispose()
  })

  describe('Net#handleApiResult', () => {
    it('should handle Object type response and consumed by `values`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)
      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
        },
        tableName: 'Event',
        assocFields: {
          creator: ['_id', 'name', 'avatarUrl']
        },
        excludeFields: ['isDeleted', 'source', 'type', 'url']
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .values()
        .do(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent)
        })
    })

    it('should handle Object type response and consumed by `changes`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)

      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
        },
        tableName: 'Event',
        assocFields: {
          creator: ['_id', 'name', 'avatarUrl']
        },
        excludeFields: ['isDeleted', 'source', 'type', 'url']
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .changes()
        .take(1)
        .do(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent)
        })
    })

    it('should handle Object type response and get changes', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)

      const stream$ = net.lift<typeof normalEvent>({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get<any>(path),
        query: {
          where: { _id: normalEvent._id },
        },
        tableName: 'Event',
        assocFields: {
          creator: ['_id', 'name', 'avatarUrl']
        },
        excludeFields: ['isDeleted', 'source', 'type', 'url']
      })
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      const newLocation = 'test_new_location'

      yield database.update<typeof normalEvent>('Event', {
        _id: normalEvent._id
      }, {
        location: newLocation
      })

      yield stream$
        .take(1)
        .do(([r]) => {
          expect(r.location).to.deep.equal(newLocation)
        })
    })

    it('should handle Array type response and consumed by `values`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      yield net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      })
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })
    })

    it('should handle Array type response and consumed by `changes`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      yield net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      })
        .changes()
        .take(1)
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })
    })

    it('should handle Array type response and get changes', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      const stream$ = net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      } as ApiResult<EventSchema, CacheStrategy.Request>)
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      const newLocation = 'new_event_location'

      yield database.update('Event', {
        _id: projectEvents[0]._id
      }, {
        location: newLocation
      })

      yield stream$.take(1)
        .do(([e]) => {
          expect(e.location).to.equal(newLocation)
        })
    })

    it('should handle Array type response and validate cache', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      spyFetch = spy(sdkFetch, 'get')

      const newLocation = 'new_event_location'

      const partialEvent = {
        _id: uuid(),
        _projectId: projectEvents[0]._projectId,
        location: newLocation
      }

      const stream$ = net.lift<any>({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get<any>(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => sdkFetch.get<any>(`api/events/${id}`)
      })
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events: typeof projectEvents) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(projectEvents.length + 1)
        })

    })

    it('should handle empty Array', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond([])

      spyFetch = spy(sdkFetch, 'get')

      const newLocation = 'new_event_location'

      const partialEvent = {
        _id: uuid(),
        _projectId: projectEvents[0]._projectId,
        location: newLocation
      }

      const stream$ = net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get<any>(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => sdkFetch.get<any>(`api/events/${id}`)
      })
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events: typeof projectEvents) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(1)
        })
    })

    it('should get result from cached Response and consumed by `values`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      const getToken = () => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      })

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })
    })

    it('should get result from cached Response and consumed by `changes`', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      const getToken = () => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      })

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })

      yield getToken()
        .changes()
        .take(1)
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })
    })

    it('should get result from cached Response and get changes', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      const getToken = () => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ]
      } as ApiResult<EventSchema, CacheStrategy.Request>)

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })

      const stream$ = getToken()
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      const newLocation = 'new_event_location'

      yield database.update('Event', {
        _id: projectEvents[0]._id
      }, {
        location: newLocation
      })

      yield stream$.take(1)
        .do(([r]) => {
          expect(r.location).to.equal(newLocation)
        })
    })

    it('should get result from cached Response and validate cache', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(projectEvents)

      const getToken = () => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get<any>(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => sdkFetch.get<any>(`api/events/${id}`)
      })

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })

      spyFetch = spy(sdkFetch, 'get')

      const newLocation = 'new_event_location'

      const partialEvent = {
        _id: uuid(),
        _projectId: projectEvents[0]._projectId,
        location: newLocation
      }

      const stream$ = getToken()
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)

      // 多请求一次，保证 padding 被执行之后，再次从 ReactiveDB 里面拿数据的时候应该能拿到完整的数据
      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events: typeof projectEvents) => {
           expect(spyFetch.callCount).to.equal(2)
           expect(events.length).to.equal(projectEvents.length + 1)
        })

      http.restore()
    })

    it('should not revalidate(by server) on result set that does not include data with { __cacheIsInvalid__: true }', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond({ isDone: false, _id: '5a17b9a5a58dd8a0cddec5e6' })

      const targetTaskId = '5a17b9a5a58dd8a0cddec5e6'
      const anotherTaskId = '5a17b9a5a58dd8a0cddec5e7'

      const getTask = (_id: string) => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get<any>(path),
        query: { where: { _id, isDone: true } },
        tableName: 'Task'
      })

      yield getTask(targetTaskId).values().do((rs) => {
        expect(rs).to.have.lengthOf(0)
      })

      yield database.upsert('Task', { _id: targetTaskId, isDone: true })

      yield getTask(targetTaskId).values().do((rs) => {
        expect(rs).to.have.lengthOf(1)
      })

      yield database.upsert('Task', { _id: anotherTaskId, __cacheIsInvalid__: true })

      yield getTask(targetTaskId).values().do((rs) => {
        expect(rs).to.have.lengthOf(1)
      })
    })

    it('should revalidate(by server) on result set that include data with { __cacheIsInvalid__: true }', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond({ isDone: false, _id: '5a17b9a5a58dd8a0cddec5e6' })

      const targetTaskId = '5a17b9a5a58dd8a0cddec5e6'

      const getTask = (_id: string) => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get<any>(path),
        query: { where: { _id, isDone: true } },
        tableName: 'Task'
      })

      yield getTask(targetTaskId).values().do((rs) => {
        expect(rs).to.have.lengthOf(0)
      })

      yield database.upsert('Task', { _id: targetTaskId, isDone: true, __cacheIsInvalid__: true })

      yield getTask(targetTaskId).changes().take(1).do((rs) => {
        expect(rs).to.have.lengthOf(0)
      })
    })

    it('invalid cacheStrategy should throw', () => {
      const fn = () => net.lift({
        cacheValidate: 2313,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => sdkFetch.get<any>(`api/events/${id}`)
      } as ApiResult<EventSchema, 2313>)

      expect(fn).to.throw('unreachable code path')
    })

    it('invalid tableName should throw', () => {
      const fn = () => net.lift({
        cacheValidate: CacheStrategy.Request,
        request: sdkFetch.get(path),
        query: {
          where: { _projectId: projectEvents[0]._projectId },
        },
        tableName: '__NOT_EXIST__',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => sdkFetch.get<any>(`api/events/${id}`)
      } as ApiResult<EventSchema, CacheStrategy.Request> )

      expect(fn).to.throw('table: __NOT_EXIST__ is not defined')
    })

  })

})
