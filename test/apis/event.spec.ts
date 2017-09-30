import * as moment from 'moment'
import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, EventSchema } from '../index'
import * as Fixture from '../fixtures/events.fixture'
import { mock, restore, equals, looseDeepEqual, clone } from '../utils'

describe('EventApi request spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should get normal event', function* () {
    const fixture = Fixture.normalEvent
    mockResponse(fixture)

    yield sdk.getEvent(fixture._id)
      .values()
      .do(([r]) => {
        const result = r.next().value
        equals(result, fixture)
      })
  })

  it('should get recurrnece event', function* () {
    const fixture = Fixture.recurrenceByMonth
    mockResponse(fixture)

    yield sdk.getEvent(fixture._id)
      .values()
      .do(([r]) => {
        const result = r.next().value
        const _id = fixture._id
        delete result._id
        delete fixture._id
        equals(result, fixture)
        const next = r.next().value
        expect(next.sourceDate).to.equal(fixture.startDate)
        expect(next.startDate).to.equal(moment(fixture.startDate).add(1, 'month').toISOString())
        expect(next.endDate).to.equal(moment(fixture.endDate).add(1, 'month').toISOString())
        const next2 = r.next().value
        expect(next2.sourceDate).to.equal(fixture.startDate)
        expect(next2.startDate).to.equal(moment(fixture.startDate).add(2, 'month').toISOString())
        expect(next2.endDate).to.equal(moment(fixture.endDate).add(2, 'month').toISOString())
        fixture._id = _id
      })
  })

  it('should observe recurrnece event change', function* () {
    const fixture = Fixture.recurrenceByMonth
    mockResponse(fixture)

    const signal = sdk.getEvent(fixture._id)
      .changes()

    signal.subscribe()

    yield signal.take(1)

    const mockContent = 'mockContent'

    yield sdk.database.update<EventSchema>('Event', {
      where: { _id: fixture._id }
    }, {
      content: mockContent
    })

    yield signal.take(1)
      .do(([r]) => {
        expect(r.next().value.content).to.equal(mockContent)
      })
  })

  it('should combine two QueryToken', function* () {
    const fixture = Fixture.recurrenceByMonth
    mockResponse(fixture)

    const token1 = sdk.getEvent(fixture._id)

    const f2 = clone(fixture)
    f2._id = 'mockF2Id'
    mockResponse(f2)

    const token2 = sdk.getEvent(f2._id)

    yield token1.combine(token2)
      .values()
      .do(([r1, r2]) => {
        const result1 = r1.next().value
        const result2 = r2.next().value
        delete result1._id
        delete result2._id
        expect(result1).to.deep.equal(result2)
      })
  })
})

describe('EventsAPI socket spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('new event should add cache', function* () {
    const fixture = Fixture.normalEvent

    yield socket.emit('new', 'event', '', fixture)

    yield sdk.database.get<EventSchema>('Event', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => {
        looseDeepEqual(r, fixture)
      })
  })

  it('update event should change cache', function* () {
    const fixture = Fixture.normalEvent

    yield sdk.database.insert('Event', fixture)

    yield socket.emit('change', 'event', fixture._id, {
      _id: fixture._id,
      content: 'fixture'
    })

    yield sdk.database.get<EventSchema>('Event', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => expect(r.content).to.equal('fixture'))
  })

  it('delete event should delete cache', function* () {
    const fixture = Fixture.normalEvent

    yield sdk.database.insert('Event', fixture)

    yield socket.emit('destroy', 'event', fixture._id)

    yield sdk.database.get<EventSchema>('Event', { where: { _id: fixture._id } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })
})
