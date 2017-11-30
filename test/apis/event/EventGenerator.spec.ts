import { describe, beforeEach, it } from 'tman'
import { expect } from 'chai'
import * as Moment from 'moment'
import {
  recurrenceByMonth,
  recurrenceHasEnd,
  recurrenceStartAtAnExcludedDate,
  emptyRecurrence,
  normalEvent
} from '../../fixtures/events.fixture'
import { EventGenerator, findByEventId, RecurrenceInstance } from '../../../src/apis/event/EventGenerator'
import { clone, EventSchema } from '../../index'

describe('EventGenerator spec', () => {
  let eventGenerator: RecurrenceInstance<EventSchema>
  beforeEach(() => {
    eventGenerator = new EventGenerator(recurrenceByMonth as any)
  })

  it('new operator should return instanceof EventGenerator', () => {
    expect(eventGenerator).to.be.instanceof(EventGenerator)
  })

  it('should get next event for a normal event', () => {
    const egenOfNormal = new EventGenerator(normalEvent as any)
    const { done, value } = egenOfNormal.next()
    expect(done).to.false
    expect(value).to.deep.equal(normalEvent)
    expect(egenOfNormal.next().done).to.true
  })

  it('should get next event for a recurrent event', () => {
    const nextEvent = eventGenerator.next()
    const expected = clone(recurrenceByMonth);
    ['_id', 'startDate', 'endDate']
      .forEach(f => {
        delete nextEvent.value![f]
        delete expected[f]
      })
    expect(nextEvent.done).to.false
    expect(nextEvent.value).to.deep.equal(expected)
  })

  it('next and next should return correct value', () => {
    eventGenerator.next()
    const nextEvent = eventGenerator.next()
    expect(nextEvent.done).to.false
    expect(nextEvent.value!.startDate).to.deep.equal(Moment(recurrenceByMonth.startDate).add(1, 'month').toISOString())
    const nextEvent1 = eventGenerator.next()
    expect(nextEvent.done).to.false
    expect(nextEvent1.value!.startDate).to.deep.equal(Moment(recurrenceByMonth.startDate).add(2, 'month').toISOString())
  })

  it('next, ... will come to { done: true } for a recurrent event that has an end', () => {
    const egen = new EventGenerator(recurrenceHasEnd as any)
    const until = new Date(recurrenceHasEnd.untilDate)
    let curr = egen.next()
    let next = egen.next()
    let nstart: string
    for (; ; curr = next, next = egen.next()) {
      if (!curr.value) {
        expect(curr.done).true
        expect(next.done).true
        break
      }
      nstart = curr.value.startDate
      if (new Date(nstart).valueOf() === until.valueOf()) {
        expect(next.done).true
      }
      // 只要走到这里，代表 curr.value 还有值
      expect(curr.done).false
    }
  })

  it('next() should start correctly when the recurrence starts at an excluded date', () => {
    const egen = new EventGenerator(recurrenceStartAtAnExcludedDate as any)
    const actual = egen.next().value!
    delete actual['_id']
    const expected = clone(recurrenceStartAtAnExcludedDate)
    delete expected['_id']
    expected.startDate = '2017-06-07T09:00:00.000Z'
    expected.endDate = '2017-06-07T10:00:00.000Z'
    expect(actual).to.deep.equal(expected)
  })

  it('next() should always return { done: true, value: undefined } on an empty recurrence', () => {
    const egen = new EventGenerator(emptyRecurrence as any)
    expect(egen.next()).to.deep.equal({ done: true, value: undefined })
    expect(egen.next()).to.deep.equal({ done: true, value: undefined })
  })

  it('takeUntil() an out range Date should return empty array', () => {
    const from = Moment(recurrenceByMonth.startDate).add(-10, 'year').toDate()
    const result = eventGenerator.takeUntil(from)
    expect(result).to.deep.equal([])
  })

  it('takeUntil() should return correct value', () => {
    const start = new Date(recurrenceByMonth.startDate)
    const result = eventGenerator.takeUntil(Moment(start).add(12, 'month').toDate())
    expect(result.length).to.equal(12)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(start).add(index, 'month').toISOString())
    })
  })

  it('takeUntil() should exclude events whose endDate is out of the additionally specified range', () => {
    const start = new Date(recurrenceByMonth.startDate)
    const startDateUntil = Moment(start).add(11, 'month').toDate()
    const endDateUntil = startDateUntil
    const result = eventGenerator.takeUntil(startDateUntil, endDateUntil)
    expect(result).lengthOf(11)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(start).add(index, 'month').toISOString())
    })
  })

  it('takeUntil() hasEnd recurrence event should return correct result', () => {
    const _eventGenerator = new EventGenerator(recurrenceHasEnd as any)
    const result = _eventGenerator.takeUntil(Moment().add(1, 'day').startOf('day').toDate())
    expect(result.length).to.equal(15)
  })

  it('takeUntil() a normal event should return single value array', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const until = Moment(normalEvent.endDate).add(1, 'day').startOf('day').toDate()
    const result = _eventGenerator.takeUntil(until)
    expect(result.length).to.equal(1)
    expect(result).to.deep.equal([normalEvent])
  })

  it('takeUntil() should not be interfered by next()', () => {
    // 普通日程
    const _eventGenerator = new EventGenerator(normalEvent as any)
    _eventGenerator.next()
    expect(_eventGenerator.next().done).true
    const until = Moment(normalEvent.endDate).add(1, 'day').startOf('day').toDate()
    let result = _eventGenerator.takeUntil(until)
    expect(result.length).to.equal(1)
    expect(result).to.deep.equal([normalEvent])

    // 重复日程
    const start = new Date(recurrenceByMonth.startDate)
    for (let i = 0; i < 12; i++) {
      eventGenerator.next()
    }
    result = eventGenerator.takeUntil(Moment(start).add(12, 'month').toDate())
    expect(result.length).to.equal(12)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(start).add(index, 'month').toISOString())
    })
  })

  it('takeFrom() an out range Date should return empty array', () => {
    const refDate = recurrenceByMonth.startDate
    const fromDate = Moment(refDate).subtract(10, 'years').toDate()
    const toDate = Moment(refDate).subtract(9, 'years').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate)

    expect(result).to.deep.equal([])
  })

  it('takeFrom() should return correct values', () => {
    const fromDate = new Date('2017-08-01T00:00:00Z')
    const toDate = Moment(fromDate).add(10, 'month').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate)
    const [ first ] = result

    expect(result.length).to.equal(10)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(first.startDate).add(index, 'month').toISOString())
      expect(r.endDate).to.equal(Moment(first.endDate).add(index, 'month').toISOString())
    })
  })

  it('takeFrom() should include events whose endDate is in the range', () => {
    const fromDate = Moment(recurrenceByMonth.startDate).add(1, 'minutes').toDate()
    const toDate = Moment(recurrenceByMonth.endDate).add(1, 'minutes').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate)
    expect(result).lengthOf(1)
  })

  it('takeFrom() should include events whose startDate is in the range', () => {
    const fromDate = new Date(recurrenceByMonth.startDate)
    const toDate = Moment(recurrenceByMonth.startDate).add(1, 'minutes').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate)
    expect(result).lengthOf(1)
  })

  it('takeFrom() should include events whose timespan strictly contains the range', () => {
    const fromDate = Moment(recurrenceByMonth.startDate).add(1, 'minutes').toDate()
    const toDate = Moment(recurrenceByMonth.endDate).subtract(1, 'minutes').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate)
    expect(result).lengthOf(1)
  })

  it('takeFrom() should exclude events whose endDate is out of the additionally specified range', () => {
    const fromDate = new Date(recurrenceByMonth.startDate)
    const toDate = Moment(recurrenceByMonth.startDate).add(1, 'minutes').toDate()
    const untilDate = Moment(recurrenceByMonth.endDate).subtract(1, 'minutes').toDate()
    const result = eventGenerator.takeFrom(fromDate, toDate, untilDate)
    expect(result).lengthOf(0)
  })

  it('takeFrom() hasEnd recurrence event should return correct values', () => {
    const _eventGenerator = new EventGenerator(recurrenceHasEnd as any)
    const startDay = recurrenceHasEnd.startDate
    const result = _eventGenerator.takeFrom(Moment(startDay).subtract(1, 'day').toDate(), Moment().add(1, 'day').startOf('day').toDate())
    expect(result.length).to.equal(15)
  })

  it('takeFrom() normal event should return single value array when date is in range', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const startDay = Moment(normalEvent.startDate).startOf('day')
    const result = _eventGenerator.takeFrom(startDay.toDate(), startDay.clone().endOf('day').toDate())
    expect(result.length).to.equal(1)
    expect(result).to.deep.equal([normalEvent])
  })

  it('takeFrom() normal event should return empty array when date is out of range', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const startDay = Moment(normalEvent.startDate).add(1, 'day').startOf('day')
    const result = _eventGenerator.takeFrom(startDay.toDate(), startDay.clone().endOf('day').toDate())
    expect(result).to.deep.equal([])
  })

  it('takeFrom() recurrent event that starts at an excluded date should ignore the excluded recurrence', () => {
    const egen = new EventGenerator(recurrenceStartAtAnExcludedDate as any)
    const startDate = new Date(recurrenceStartAtAnExcludedDate.startDate)
    const beforeFirstRecurrence = Moment(startDate).add(1, 'weeks').subtract(1, 'ms').toDate()
    expect(egen.takeFrom(startDate, beforeFirstRecurrence)).to.deep.equal([])
  })

  it('takeFrom() empty recurrence should return empty array', () => {
    const egen = new EventGenerator(emptyRecurrence as any)
    const startDate = new Date(emptyRecurrence.startDate)
    const foreseeableFuture = new Date('9999-12-31')
    expect(egen.takeFrom(startDate, foreseeableFuture)).to.deep.equal([])
  })

  it('takeFrom(x, y) and takeFrom(y, z) should concat to takeFrom(x, z)', () => {
    const [x, y, z] = [0, 1, 2].map((i) => {
      return Moment(recurrenceByMonth.startDate).add(i, 'months').toDate()
    })

    const takeFromXY = eventGenerator.takeFrom(x, y)
    const takeFromYZ = eventGenerator.takeFrom(y, z)
    const takeFromXZ = eventGenerator.takeFrom(x, z)

    expect(takeFromXY).to.have.lengthOf(1)
    expect(takeFromYZ).to.have.lengthOf(1)
    expect(takeFromXZ).to.have.lengthOf(2)
    expect([...takeFromXY, ...takeFromYZ]).to.deep.equal(takeFromXZ)
  })

  it('after() should work on a normal event', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const startDate = new Date(normalEvent.startDate)
    expect(_eventGenerator.after(startDate)).to.deep.equal(normalEvent)
    expect(_eventGenerator.after(new Date(startDate.valueOf() - 1))).to.deep.equal(normalEvent)
    expect(_eventGenerator.after(new Date(startDate.valueOf() + 1))).to.be.null
  })

  it('after() should work on a recurrent event', () => {
    let startDate = new Date(recurrenceByMonth.startDate)
    const firstMonthEvent = eventGenerator.after(startDate)
    delete firstMonthEvent!['_id']
    const firstEvent = clone(recurrenceByMonth)
    delete firstEvent['_id']
    expect(firstMonthEvent).to.deep.equal(firstEvent)

    startDate = new Date(recurrenceHasEnd.untilDate)
    expect(new EventGenerator(recurrenceHasEnd as any).after(new Date(startDate.valueOf() + 1))).to.be.null

    startDate = new Date(recurrenceStartAtAnExcludedDate.startDate)
    expect(new EventGenerator(recurrenceStartAtAnExcludedDate as any).after(startDate)!.startDate)
      .to.equal(Moment(startDate).add(1, 'weeks').toISOString())

    startDate = new Date(emptyRecurrence.startDate)
    expect(new EventGenerator(emptyRecurrence as any).after(startDate)).to.be.null
  })

  it('takeFrom(x, y) and after(y) should behave like arr.slice(i, j) and arr.slice(j, j+1)', () => {
    const [x, y, y1] = [0, 3, 4].map((i) => {
      return Moment(recurrenceByMonth.startDate).add(i, 'months').toDate()
    })

    const takeFromXY = eventGenerator.takeFrom(x, y)
    const afterY = eventGenerator.after(y)
    const takeFromXY1 = eventGenerator.takeFrom(x, y1)

    const takeFromXYConcatAfterY = [...takeFromXY, afterY]

    expect(takeFromXYConcatAfterY).to.have.lengthOf(4)
    expect(takeFromXYConcatAfterY).to.deep.equal(takeFromXY1)
  })

  it('findByEventId() should work on a normal event', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const targetId = normalEvent._id
    const invalidId = normalEvent._id + 'asdf'

    expect(findByEventId(_eventGenerator, targetId)).to.deep.equal(normalEvent)
    expect(findByEventId(_eventGenerator, invalidId)).to.be.null
  })

  it('findByEventId() should return null for a recurrent event with an un-timestamped id', () => {
    const targetId = recurrenceByMonth._id
    expect(findByEventId(eventGenerator, targetId)).to.be.null
  })

  it('findByEventId() should work on a recurrent event', () => {
    let timestamp = new Date(recurrenceByMonth.startDate).valueOf()
    let targetId = recurrenceByMonth._id + '_' + timestamp
    expect(findByEventId(eventGenerator, targetId)).to.deep.equal(eventGenerator.next().value)

    timestamp = Moment(recurrenceByMonth.startDate).add(2, 'months').valueOf()
    targetId = recurrenceByMonth._id + '_' + timestamp
    eventGenerator.next()
    expect(findByEventId(eventGenerator, targetId)).to.deep.equal(eventGenerator.next().value)

    const timestampExDate = new Date(recurrenceStartAtAnExcludedDate.startDate).valueOf()
    const targetIdExDate = recurrenceStartAtAnExcludedDate._id + '_' + timestampExDate
    const eventGeneratorExDate = new EventGenerator(recurrenceStartAtAnExcludedDate as any)
    expect(findByEventId(eventGeneratorExDate, targetIdExDate)).to.be.null
  })
})
