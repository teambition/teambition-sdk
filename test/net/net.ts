import { Observable, Subscription, Scheduler } from 'rxjs'
import { describe, beforeEach, afterEach, it } from 'tman'
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

import { expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import { mapMsgTypeToTable } from '../../src/sockets/MapToTable'

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
        .do(([r]) => {
          expect(r).to.deep.equal({ _id: normalEvent._id })
        })
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
        .do(([r]) => {
          expect(r).to.deep.equal({
            _id: normalEvent._id,
            title: normalEvent.title
          })
        })
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
        .do(([r]) => {
          expect(r).to.deep.equal({
            _id: normalEvent._id
          })
        })
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
        .do(([r]) => {
          expectToDeepEqualForFieldsOfTheExpected(r, normalEvent, 'creator')
        })
    })

  })

  describe('Net#padding', () => {

    const sampleEvent = projectEvents[0]
    const _projectId = sampleEvent._projectId
    const partialEvent = { _id: uuid(), _projectId }
    const eventUrlPath = (eventId: string) => `api/events/${eventId}}`
    const getEventsWithRequired = (fetch: SDKFetch, projectId: string) => {
      return {
        cacheValidate: CacheStrategy.Request,
        request: fetch.get<any>(path),
        query: {
          where: { _projectId: projectId },
        },
        tableName: 'Event',
        excludeFields: [
          'isDeleted', 'source', 'type', 'url', 'attachmentsCount', 'commentsCount',
          'involvers', 'likesCount'
        ],
        required: ['startDate'],
        padding: (id: string) => fetch.get<any>(eventUrlPath(id))
      } as ApiResult<typeof sampleEvent, CacheStrategy.Request>
    }

    let spyFetch: sinon.SinonSpy
    let mockEventsGet: (projectId: string, resp: any[]) => void
    let mockEventGet: (eventId: string, resp: any) => void

    beforeEach(() => {
      spyFetch = spy(sdkFetch, 'get')
      mockEventsGet = (_, resp) => {
        httpBackend.whenGET(`${apiHost}/${path}`).respond(resp)
      }
      mockEventGet = (eventId, resp) => {
        httpBackend.whenGET(`${apiHost}/${eventUrlPath(eventId)}`).respond(resp)
      }
    })

    afterEach(() => {
      spyFetch.restore()
    })

    it('should handle Array type response and validate cache', function* () {
      mockEventsGet(_projectId, projectEvents)

      const stream$ = net.lift(getEventsWithRequired(sdkFetch, _projectId)).changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      mockEventGet(partialEvent._id, { ...sampleEvent, ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(projectEvents.length + 1)
        })

    })

    it('should handle empty Array', function* () {
      mockEventsGet(_projectId, [])

      const stream$ = net.lift(getEventsWithRequired(sdkFetch, _projectId)).changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      mockEventGet(partialEvent._id, { ...sampleEvent, ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events) => {
          expect(spyFetch.callCount).to.equal(2)
          expect(events.length).to.equal(1)
        })
    })

    it('should pass-through empty result set (without padding requests)', function* () {
      mockEventsGet(_projectId, [])

      yield net.lift(getEventsWithRequired(sdkFetch, _projectId)).changes()
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events) => {
          expect(spyFetch.callCount).to.equal(1)
          expect(events).to.deep.equal([])
        })
    })

    it('should pass-through all-complete result set (without padding requests)', function* () {
      const completeEvent = { ...sampleEvent, ...partialEvent }

      mockEventsGet(_projectId, [ completeEvent ])

      yield net.lift(getEventsWithRequired(sdkFetch, _projectId)).changes()
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do(([ event ]) => {
          expect(spyFetch.callCount).to.equal(1)
          expectToDeepEqualForFieldsOfTheExpected(event, completeEvent)
        })
    })

    it('padding: should emit once for one change update on a result set of size >= 2', function* () {
      mockEventsGet(_projectId, [])

      const partialEvent1 = partialEvent
      const partialEvent2 = { ...partialEvent, _id: uuid() }
      const completeEvent1 = { ...sampleEvent, ...partialEvent1 }
      const completeEvent2 = { ...sampleEvent, ...partialEvent2 }

      const stream$ = net.lift(getEventsWithRequired(sdkFetch, _projectId)).changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      mockEventGet(partialEvent1._id, completeEvent1)
      mockEventGet(partialEvent2._id, completeEvent2)

      yield database.insert('Event', [partialEvent1, partialEvent2])

      let emitCount = 0
      yield stream$
        .subscribeOn(Scheduler.asap)
        .do((events) => {
          emitCount++
          // 确认推出的数据个数和内容是正确的
          expect(events).to.have.lengthOf(2)
          events.forEach((event) => {
            if (event._id === partialEvent1._id) {
              expectToDeepEqualForFieldsOfTheExpected(event, completeEvent1)
            } else if (event._id === partialEvent2._id) {
              expectToDeepEqualForFieldsOfTheExpected(event, completeEvent2)
            } else {
              throw new Error('should emit padded data')
            }
          })
        })
        .takeUntil(Observable.timer(100)) // 给一个较长的时间，确定没有再推出数据
        .do({ complete: () => {
          expect(emitCount).to.equal(1)
        } })
    })

    it('should get result from cached Response and validate cache', function* () {
      mockEventsGet(_projectId, projectEvents)

      const getToken = () => net.lift(getEventsWithRequired(sdkFetch, _projectId))

      yield getToken()
        .values()
        .do(rs => {
          projectEvents.forEach((expected, i) => {
            expectToDeepEqualForFieldsOfTheExpected(rs[i], expected)
          })
        })
      spyFetch.restore()
      spyFetch = spy(sdkFetch, 'get')

      const stream$ = getToken()
        .changes()

      subscription = stream$.subscribe()

      yield stream$.take(1)

      mockEventGet(partialEvent._id, { ...sampleEvent, ...partialEvent })

      yield database.insert('Event', partialEvent)

      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)

      // 多请求一次，保证 padding 被执行之后，再次从 ReactiveDB 里面拿数据的时候应该能拿到完整的数据
      yield stream$
        .subscribeOn(Scheduler.asap)
        .take(1)
        .do((events) => {
           expect(spyFetch.callCount).to.equal(2)
           expect(events.length).to.equal(projectEvents.length + 1)
        })

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

    server = spy(() => Observable.of(projectEvents[0]))
    getEventOptions = (strategy: CacheStrategy, options = {}): any => {
      const defaultOptions = {
        cacheValidate: strategy,
        request: Observable.defer(server),
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
