import { describe, beforeEach, afterEach, it } from 'tman'
import { asapScheduler, defer, of } from 'rxjs'
import { subscribeOn, take, tap } from 'rxjs/operators'
import { Database, DataStoreType } from 'reactivedb'
import { expect, use } from 'chai'
import { spy } from 'sinon'
import * as SinonChai from 'sinon-chai'
import '../../src/schemas'
import { schemaColl, CacheStrategy } from '../../src/SDK'
import { Net, Backend, SDKFetch, forEach, uuid, Http, EventSchema } from '..'
import { ApiResult } from '../../src/Net/Net'
import { createMsgToDBHandler } from '../../src/sockets/EventMaps'
import { normalEvent, projectEvents } from '../fixtures/events.fixture'

import { expectToDeepEqualForFieldsOfTheExpected, tapAsap } from '../utils'
import { mapMsgTypeToTable } from '../../src/sockets/MapToTable'

use(SinonChai)

describe('Net test', () => {
  let net: Net
  let httpBackend: Backend
  let database: Database
  let version = 1
  let spyFetch: sinon.SinonSpy

  const sdkFetch = new SDKFetch()
  const apiHost = sdkFetch.getAPIHost()
  const path = 'test'
  const http = new Http(`${apiHost}/${path}`)
  const schemas = schemaColl.toArray()

  beforeEach(() => {
    httpBackend = new Backend()
    net = new Net(schemas)
    database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', version++)
    net.initMsgToDBHandler(createMsgToDBHandler(mapMsgTypeToTable))
    net.persist(database)
    forEach(schemas, d => {
      database.defineSchema(d.name, d.schema)
    })
    database.connect()
  })

  afterEach(function* () {
    httpBackend.restore()
    spyFetch && spyFetch.restore()
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
        .pipe(tap(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent)
        }))
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
        .pipe(take(1), tap(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent)
        }))
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

      yield stream$.pipe(take(1))

      const newLocation = 'test_new_location'

      yield database.update<typeof normalEvent>('Event', {
        _id: normalEvent._id
      }, {
        location: newLocation
      })

      yield stream$
        .pipe(take(1), tap(([r]) => {
          expect(r.location).to.deep.equal(newLocation)
        }))
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
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))
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
        .pipe(
          take(1),
          tap(rs => {
            projectEvents.forEach((expected, i) => {
              expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
            })
          })
        )
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

      yield stream$.pipe(take(1))

      const newLocation = 'new_event_location'

      yield database.update('Event', {
        _id: projectEvents[0]._id
      }, {
        location: newLocation
      })

      yield stream$.pipe(take(1), tap(([e]) => {
        expect(e.location).to.equal(newLocation)
      }))
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

      yield stream$.pipe(take(1))

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .pipe(take(1), tapAsap((events: typeof projectEvents) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(projectEvents.length + 1)
        }))
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

      yield stream$.pipe(take(1))

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .pipe(
          take(1),
          tapAsap((events: typeof projectEvents) => {
            expect(spyFetch.callCount).to.equal(2)
            expect(events.length).to.equal(1)
          })
        )
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
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))

      yield getToken()
        .values()
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))
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
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))

      yield getToken()
        .changes()
        .pipe(take(1), tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))
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
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))

      const stream$ = getToken()
        .changes()

      yield stream$.pipe(take(1))

      const newLocation = 'new_event_location'

      yield database.update('Event', {
        _id: projectEvents[0]._id
      }, {
        location: newLocation
      })

      yield stream$
        .pipe(take(1), tap(([r]) => {
          expect(r.location).to.equal(newLocation)
        }))
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
        .pipe(tap(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        }))

      spyFetch = spy(sdkFetch, 'get')

      const newLocation = 'new_event_location'

      const partialEvent = {
        _id: uuid(),
        _projectId: projectEvents[0]._projectId,
        location: newLocation
      }

      const stream$ = getToken().changes()

      yield stream$.pipe(take(1))

      httpBackend.whenGET(`${apiHost}/api/events/${partialEvent._id}`)
        .respond({ ...projectEvents[0], ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$.pipe(subscribeOn(asapScheduler), take(1))

      // 多请求一次，保证 padding 被执行之后，再次从 ReactiveDB 里面拿数据的时候应该能拿到完整的数据
      yield stream$.pipe(take(1), tapAsap((events: typeof projectEvents) => {
        expect(spyFetch.callCount).to.equal(2)
        expect(events.length).to.equal(projectEvents.length + 1)
      }))

      http.restore()
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

    it('should allow query.fields to specify field names to be selected', function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)
      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
          fields: ['_id']
        },
        tableName: 'Event'
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .values()
        .pipe(tap(([r]) => {
          expect(r).to.deep.equal({ _id: normalEvent._id })
        }))
    })

    it(`should allow query.fields to specify field names to be selected, ignoring 'excludeFields'`, function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)
      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
          fields: ['_id', 'title']
        },
        tableName: 'Event',
        excludeFields: ['title']
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .values()
        .pipe(tap(([r]) => {
          expect(r).to.deep.equal({
            _id: normalEvent._id,
            title: normalEvent.title
          })
        }))
    })

    it(`should allow query.fields to specify field names to be selected, ignoring non-existing ones`, function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)
      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
          fields: ['_id', 'noSuchFieldname']
        },
        tableName: 'Event'
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .values()
        .pipe(tap(([r]) => {
          expect(r).to.deep.equal({
            _id: normalEvent._id
          })
        }))
    })

    it(`should ignore empty query.fields, i.e. []`, function* () {
      httpBackend.whenGET(`${apiHost}/${path}`)
        .respond(normalEvent)
      yield net.lift({
        cacheValidate: CacheStrategy.Cache,
        request: sdkFetch.get(path),
        query: {
          where: { _id: normalEvent._id },
          fields: []
        },
        tableName: 'Event'
      } as ApiResult<EventSchema, CacheStrategy.Cache>)
        .values()
        .pipe(tap(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent, 'creator')
        }))
    })

  })

})

describe('Net CacheStrategy Spec', () => {

  let net: Net
  let database: Database
  let server: sinon.SinonSpy
  let getEventOptions: (strategy: CacheStrategy, options?: any) => any
  const testTables = new Set(['Event', 'Task'])
  const schemas = schemaColl.toArray()

  beforeEach(() => {
    net = new Net(schemas)
    database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk')
    net.persist(database)
    schemas.filter(({ name }) => testTables.has(name)).forEach((schema) => {
      database.defineSchema(schema.name, schema.schema)
    })
    database.connect()

    server = spy(() => of(projectEvents[0]))
    getEventOptions = (strategy: CacheStrategy, options = {}): any => {
      const defaultOptions = {
        cacheValidate: strategy,
        request: defer(server),
        tableName: 'Event',
        query: {
          where: {
            projectId: projectEvents[0]._projectId
          }
        }
      }
      return Object.assign(defaultOptions, options)
    }
  })

  afterEach(async () => {
    await database.dispose()
  })

  it('CacheStrategy.Request / do `request` for the 1st call', function* () {
    yield net.lift(getEventOptions(CacheStrategy.Request)).values()

    expect(server.calledOnce).to.be.true
  })

  it('CacheStrategy.Request / same `request`, `tableName`, `query` / no `request` after 1st call', function* () {
    // note: 目前的实现，要求第一个请求先完成抓取并存入缓存，后续的请求才会被省去
    yield net.lift(getEventOptions(CacheStrategy.Request)).values()
    yield net.lift(getEventOptions(CacheStrategy.Request)).values()

    expect(server.calledOnce).to.be.true
  })

  it('CacheStrategy.Request / different `tableName` / do `request` for each call', function* () {
    yield net.lift(getEventOptions(CacheStrategy.Request)).values()
    yield net.lift(getEventOptions(CacheStrategy.Request, { tableName: 'Task' })).values()

    expect(server.calledTwice).to.be.true
  })

  it('CacheStrategy.Request / different `query` / do `request` for each call', function* () {
    yield net.lift(getEventOptions(CacheStrategy.Request)).values()
    yield net.lift(getEventOptions(CacheStrategy.Request, { query: {} })).values()

    expect(server.calledTwice).to.be.true
  })

  it('CacheStrategy.Cache / do `request` for the 1st call', function* () {
    yield net.lift(getEventOptions(CacheStrategy.Cache)).values()

    expect(server.calledOnce).to.be.true
  })

  it('CacheStrategy.Cache / same `request`, `tableName`, `query` / do `request` for each following call', function* () {
    yield net.lift(getEventOptions(CacheStrategy.Cache)).values()
    yield net.lift(getEventOptions(CacheStrategy.Cache)).values()
    yield net.lift(getEventOptions(CacheStrategy.Cache)).values()

    expect(server.calledThrice).to.be.true
  })

  it('Invalid cache strategy should throw on lift call', () => {
    const fn = () => net.lift(getEventOptions(2313))

    expect(fn).to.throw('unreachable code path')
  })
})
