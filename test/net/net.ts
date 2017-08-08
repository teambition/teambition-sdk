import { Subscription, Scheduler } from 'rxjs'
import { describe, beforeEach, afterEach, it } from 'tman'
import { Database, DataStoreType } from 'reactivedb'
import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as SinonChai from 'sinon-chai'
import '../../src/schemas'
import { schemas, CacheStrategy } from '../../src/SDK'
import { Net, Backend, SDKFetch, forEach, uuid, Http, EventSchema,  } from '..'
import { ApiResult } from '../../src/Net/Net'
import { normalEvent, projectEvents } from '../fixtures/events.fixture'

use(SinonChai)

describe('Net test', () => {
  let net: Net
  let httpBackend: Backend
  let database: Database
  let version = 1
  let subscription: Subscription | undefined
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
          expect(r).to.deep.equal(normalEvent)
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
          expect(r).to.deep.equal(normalEvent)
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
        .publishReplay(1)
        .refCount()

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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
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
        .publishReplay(1)
        .refCount()

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

      const spyFetch = spy(sdkFetch, 'get')

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
        .publishReplay(1)
        .refCount()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.async)
        .take(1)
        .do((events: typeof projectEvents) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(projectEvents.length + 1)
        })

      spyFetch.restore()
    })

    it('should handle empty Array', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond([])

      const spyFetch = spy(sdkFetch, 'get')

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
        .publishReplay(1)
        .refCount()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.async)
        .take(1)
        .do((events: typeof projectEvents) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(1)
        })

      spyFetch.restore()
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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
        })

      yield getToken()
        .values()
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
        })

      yield getToken()
        .changes()
        .take(1)
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
        })

      const stream$ = getToken()
        .changes()
        .publishReplay(1)
        .refCount()

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
        .do(r => {
          expect(r).to.deep.equal(projectEvents)
        })

      const spyFetch = spy(sdkFetch, 'get')

      const newLocation = 'new_event_location'

      const partialEvent = {
        _id: uuid(),
        _projectId: projectEvents[0]._projectId,
        location: newLocation
      }

      const stream$ = getToken()
        .changes()
        .publishReplay(1)
        .refCount()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.async)
        .take(1)

      // 多请求一次，保证 padding 被执行之后，再次从 ReactiveDB 里面拿数据的时候应该能拿到完整的数据
      yield stream$
        .subscribeOn(Scheduler.async)
        .take(1)
        .do((events: typeof projectEvents) => {
           expect(spyFetch.callCount).to.equal(2)
           expect(events.length).to.equal(projectEvents.length + 1)
        })

      http.restore()
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
