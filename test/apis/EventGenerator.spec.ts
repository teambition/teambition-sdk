import { describe, beforeEach, it } from 'tman'
import { expect } from 'chai'
import * as Moment from 'moment'
import {
  recurrenceByMonth,
  recurrenceHasEnd,
  recurrenceStartAtAnExcludedDate,
  normalEvent
} from '../fixtures/events.fixture'
import { EventGenerator } from '../../src/apis/event/EventGenerator'
import { clone } from '../index'

describe('EventGenerator spec', () => {
  let eventGenerator: EventGenerator
  beforeEach(() => {
    eventGenerator = new EventGenerator(recurrenceByMonth as any)
  })

  it('new operator should return instanceof EventGenerator', () => {
    expect(eventGenerator).to.be.instanceof(EventGenerator)
  })

  it('should get next event for a normal event', () => {
    const egenOfNormal = new EventGenerator(normalEvent as any)
    const { done, value } = egenOfNormal.next()
    expect(done).to.true
    expect(value).to.deep.equal(normalEvent)
  })

  it('should get next event for a recurrent event', () => {
    const nextEvent = eventGenerator.next()
    const expected = clone(recurrenceByMonth);
    ['_id', 'startDate', 'endDate']
      .forEach(f => {
        delete nextEvent.value[f]
        delete expected[f]
      })
    expect(nextEvent.done).to.false
    expect(nextEvent.value).to.deep.equal(expected)
  })

  it('next and next should return correct value', () => {
    eventGenerator.next()
    const nextEvent = eventGenerator.next()
    expect(nextEvent.done).to.false
    expect(nextEvent.value.startDate).to.deep.equal(Moment(recurrenceByMonth.startDate).add(1, 'month').toISOString())
    const nextEvent1 = eventGenerator.next()
    expect(nextEvent.done).to.false
    expect(nextEvent1.value.startDate).to.deep.equal(Moment(recurrenceByMonth.startDate).add(2, 'month').toISOString())
  })

  it('next, ... will come to { done: true } for a recurrent event that has an end', () => {
    const egen = new EventGenerator(recurrenceHasEnd as any)
    const until = new Date(recurrenceHasEnd.untilDate)
    let next = egen.next()
    let nextnext = egen.next()
    let nstart: string
    let nnstart: string
    for (; ; next = nextnext, nextnext = egen.next()) {
      nstart = next.value.startDate
      nnstart = nextnext.value.startDate
      if (!nnstart) {
        expect(next.done).to.true
      }
      if (new Date(nnstart).valueOf() === until.valueOf()) {
        expect(nextnext.done).to.true
        return
      }
      expect(next.done).to.false
    }
  })

  it('next should start correctly when the recurrence starts at an excluded date', () => {
    const egen = new EventGenerator(recurrenceStartAtAnExcludedDate as any)
    const actual = egen.next().value
    delete actual['_id']
    const expected = clone(recurrenceStartAtAnExcludedDate)
    delete expected['_id']
    expected.startDate = '2017-06-07T09:00:00.000Z'
    expected.endDate = '2017-06-07T10:00:00.000Z'
    expect(actual).to.deep.equal(expected)
  })

  it('takeUntil an out range Date should return empty array', () => {
    const from = Moment(recurrenceByMonth.startDate).add(-10, 'year').toDate()
    const result = eventGenerator.takeUntil(from)
    expect(result).to.deep.equal([])
  })

  it('takeUntil should return correct value', () => {
    const start = new Date(recurrenceByMonth.startDate)
    const result = eventGenerator.takeUntil(Moment(start).add(11, 'month').toDate())
    expect(result.length).to.equal(11)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(start).add(index, 'month').toISOString())
    })
  })

  it('takeUntil hasEnd recurrence event should return correct result', () => {
    const _eventGenerator = new EventGenerator(recurrenceHasEnd as any)
    const result = _eventGenerator.takeUntil(Moment().add(1, 'day').startOf('day').toDate())
    expect(result.length).to.equal(100)
  })

  it('takeUntil a normal event should return single value array', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const result = _eventGenerator.takeUntil(Moment().add(1, 'day').startOf('day').toDate())
    expect(result.length).to.equal(1)
    expect(result).to.deep.equal([normalEvent])
  })

  it('takeFrom an out range Date should return empty array', () => {
    const now = new Date
    const result = eventGenerator.takeFrom(Moment(now).add(-10, 'year').toDate(), Moment(now).add(-9, 'year').toDate())
    expect(result).to.deep.equal([])
  })

  it('takeFrom should return correct values', () => {
    const now = new Date
    const result = eventGenerator.takeFrom(now, Moment(now).add(10, 'month').toDate())
    const [ first ] = result
    expect(result.length).to.equal(10)
    result.forEach((r, index) => {
      expect(r.startDate).to.equal(Moment(first.startDate).add(index, 'month').toISOString())
      expect(r.endDate).to.equal(Moment(first.endDate).add(index, 'month').toISOString())
    })
  })

  it('takeFrom hasEnd recurrence event should return correct values', () => {
    const _eventGenerator = new EventGenerator(recurrenceHasEnd as any)
    const startDay = recurrenceHasEnd.startDate
    const result = _eventGenerator.takeFrom(Moment(startDay).subtract(1, 'day').toDate(), Moment().add(1, 'day').startOf('day').toDate())
    expect(result.length).to.equal(100)
  })

  it('takeFrom normal event should return single value array when date is in range', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const startDay = Moment(normalEvent.startDate).startOf('day')
    const result = _eventGenerator.takeFrom(startDay.toDate(), startDay.clone().endOf('day').toDate())
    expect(result.length).to.equal(1)
    expect(result).to.deep.equal([normalEvent])
  })

  it('takeFrom normal event should return empty array when date is out of range', () => {
    const _eventGenerator = new EventGenerator(normalEvent as any)
    const startDay = Moment(normalEvent.startDate).add(1, 'day').startOf('day')
    const result = _eventGenerator.takeFrom(startDay.toDate(), startDay.clone().endOf('day').toDate())
    expect(result).to.deep.equal([])
  })
})
