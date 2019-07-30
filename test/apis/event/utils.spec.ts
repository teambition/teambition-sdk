import { describe, it, beforeEach } from 'tman'
import { expect } from 'chai'
import * as Moment from 'moment'

import * as e from '../../../src/apis/event/utils'

import {
  recurrenceByMonth,
  recurrenceHasEnd,
  recurrenceStartAtAnExcludedDate,
  emptyRecurrence,
  normalEvent
} from '../../fixtures/events.fixture'
import { Generator } from '../../../src/apis/event'
import { forEachFalsyValueOfProperty } from '../../utils'

describe('Event-related util functions', () => {

  const now = Moment().toISOString()

  it('isRecurrent() should return true for a recurrent event', () => {
    [recurrenceByMonth, recurrenceHasEnd, recurrenceStartAtAnExcludedDate].forEach((sampleEvent) => {
      expect(e.isRecurrent(sampleEvent as any)).to.be.true
    })
  })

  it('isRecurrent() should return true for an event with rruleset that contains no occurence', () => {
    expect(e.isRecurrent(emptyRecurrence as any)).to.be.true
  })

  it('isRecurrent() should return false when param has no or falsy \'recurrence\' property', () => {
    forEachFalsyValueOfProperty('recurrence', (patch) => {
      expect(e.isRecurrent({ ...normalEvent, ...patch } as any)).to.be.false
    })
  })

  it('isRecurrent() should return false when param has \'recurrence\' property of []', () => {
    expect(e.isRecurrent({ recurrence: [] } as any)).to.be.false
  })

  it('isAllDay() should return the value of field `isAllDay`, whenever it is true/false, even if the LEGACY mode reports otherwise', () => {
    expect(e.isAllDay({
      isAllDay: true,
      allDayStart: '2017-10-30',
      allDayEnd: '2017-10-31'
    } as any)).to.be.true

    expect(e.isAllDay({
      isAllDay: false,
      allDayStart: '',
      allDayEnd: ''
    } as any)).to.be.false

    expect(e.isAllDay({
      isAllDay: true,
      allDayStart: '2017-10-30',
      allDayEnd: '2017-10-31',
      startDate: Moment(now).toISOString(),
      endDate: Moment(now).add(1, 'hour').toISOString()
    } as any)).to.be.true

    expect(e.isAllDay({
      isAllDay: false,
      allDayStart: '',
      allDayEnd: '',
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    } as any)).to.be.false
  })

  it(`${e.isAllDayLegacy.name}() should return true for an event from 00:00 to 00:00 of the next day`, () => {
    expect(e.isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    } as any)).to.be.true
  })

  it(`${e.isAllDayLegacy.name}() should return true for an event from 00:00 to 00:00 of the next nth days`, () => {
    const nthDays = [3, 5, 7]

    nthDays.forEach((nthDay) => {
      expect(e.isAllDayLegacy({
        startDate: Moment(now).startOf('day').toISOString(),
        endDate: Moment(now).add(nthDay, 'day').startOf('day').toISOString()
      } as any)).to.be.true
    })
  })

  it(`${e.isAllDayLegacy.name}() should return false for an event from 00:00 to 00:00 of the same day`, () => {
    expect(e.isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).startOf('day').toISOString()
    } as any)).to.be.false
  })

  it(`${e.isAllDayLegacy.name}() should return false for an event from 00:00 to 23:59:999 of the same day`, () => {
    expect(e.isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).endOf('day').toISOString()
    } as any)).to.be.false
  })

  it(`${e.isAllDayLegacy.name}() should return false for an event that doesn\'t start at 00:00`, () => {
    expect(e.isAllDayLegacy({
      startDate: Moment(now).startOf('day').add(1, 'hour').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').add(1, 'hour').toISOString()
    } as any)).to.be.false
  })

  it(`${e.dateToTime.name}() takes date info from input string, and returns zero o'clock of the date in current timezone in string`, () => {
    const expected = '2017-11-30T06:00:00.000Z'
    expect(e.dateToTime('2017-11-30')).to.equal(expected)
    expect(e.dateToTime('2017-11-30T00:00:00Z')).to.equal(expected)
    expect(e.dateToTime('2017-11-30T02:58:09.293Z')).to.equal(expected)
  })

  it(`${e.timeToDate.name}() takes from input string the date info as interpreted in current timezone, and returns it as 'YYYY-MM-DD'`, () => {
    expect(e.timeToDate('2017-11-30T06:00:00Z')).to.equal('2017-11-30')
    expect(e.timeToDate('2017-11-30T05:59:59Z')).to.equal('2017-11-29')
  })

  it('normFromAllDayAttrs() should return orginal startDate/endDate for object without allday info', () => {
    const startEndDate = {
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    }
    expect(e.normFromAllDayAttrs(startEndDate)).to.deep.equal(startEndDate)
  })

  it(`${e.normFromAllDayAttrs.name}() should drop allDayStart/allDayEnd for non-allday info`, () => {
    const nonAllDayInfo = {
      isAllDay: false,
      startDate: '2018-01-04T22:30:00.000Z',
      endDate: '2018-01-04T22:40:00.000Z',
      allDayStart: 'not to be used',
      allDayEnd: 'not to be used'
    }
    expect(e.normFromAllDayAttrs(nonAllDayInfo)).to.deep.equal({
      isAllDay: false,
      startDate: '2018-01-04T22:30:00.000Z',
      endDate: '2018-01-04T22:40:00.000Z'
    })
  })

  it('normFromAllDayAttrs() should return valid allday event startDate/endDate when provided with allday info', () => {
    const allDayInfos = [0, 1, 2].map((nth) => ({
      isAllDay: true,
      allDayStart: '2017-10-10',
      allDayEnd: '2017-10-1' + nth
    }))

    allDayInfos.forEach((allDayInfo) => {
      const normed: any = e.normFromAllDayAttrs(allDayInfo)
      expect(e.isAllDay(normed)).to.be.true
      expect(e.isAllDayLegacy(normed)).to.be.true
    })
  })

  it('normToAllDayAttrs() should replace startDate/endDate info with allDayStart/allDayEnd info on allday events', () => {
    const allDayInfos = [0, 1, 2].map((nth) => ({
      isAllDay: true,
      allDayStart: '2017-10-10',
      allDayEnd: '2017-10-1' + nth
    }))

    allDayInfos.forEach((allDayInfo) => {
      expect(e.normToAllDayAttrs(e.normFromAllDayAttrs(allDayInfo))).to.deep.equal(allDayInfo)
    })
  })

  it('normToAllDayAttrs() should keep startDate/endDate info without augmenting allDayStart/allDayEnd on non-allday events', () => {
    const startEndDate = {
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    }

    expect(e.normToAllDayAttrs(startEndDate)).to.deep.equal(startEndDate)
  })

  it(`${e.normFromAllDayAttrs.name} and ${e.normToAllDayAttrs.name} should form a dual pair`, () => {
    const samples = [
      {},
      {
        isAllDay: false,
        startDate: '2017-12-21T10:36:57.414Z',
        endDate: '2017-12-21T11:00:00.000Z',
        allDayStart: 'hello',
        allDayEnd: 'world'
      },
      {
        isAllDay: true,
        allDayStart: '2017-12-21',
        allDayEnd: '2017-12-21',
        startDate: 'hello',
        endDate: 'world',
        recurrence: [
          'RRULE:FREQ=DAILY;DTSTART=20171221;UNTIL=20171231',
          'EXDATE:20171225,20171226'
        ]
      }
    ]

    samples.forEach((sample) => {
      const normed = e.normFromAllDayAttrs(sample)
      const raw = e.normToAllDayAttrs(normed)
      expect(e.normFromAllDayAttrs(raw)).to.deep.equal(normed)
    })
  })

  it('originEventId() should pick out origin event id from generated id', () => {
    const originId = recurrenceByMonth._id
    const gen = new Generator(recurrenceByMonth as any)

    for (let i = 0; i < 5; i++) {
      const { _id } = gen.next().value!
      expect(e.originEventId(_id)).to.equal(originId)
    }
  })

  it('originEventId() should return the id as it is if the id is original', () => {
    const originId = recurrenceByMonth._id
    const gen = new Generator(recurrenceByMonth as any)

    for (let i = 0; i < 5; i++) {
      const { _id } = gen.next().value!
      expect(e.originEventId(e.originEventId(_id))).to.equal(originId)
    }
  })
})

describe('normalization of allday attrs with recurrence', () => {

  let rawAllDay: any
  let rawNonAllDay: any
  let normedAllDay: any
  let normedNonAllDay: any

  beforeEach(() => {
    rawAllDay = {
      isAllDay: true,
      recurrence: [
        'RRULE:FREQ=DAILY;DTSTART=20171221;UNTIL=20171231',
        'EXDATE:20171225,20171226'
      ]
    }
    normedAllDay = {
      isAllDay: true,
      recurrence: [
        'RRULE:FREQ=DAILY;DTSTART=20171221T060000Z;UNTIL=20171231T060000Z',
        'EXDATE:20171225T060000Z,20171226T060000Z'
      ]
    }
    rawNonAllDay = {
      isAllDay: false,
      recurrence: [
        'RRULE:FREQ=DAILY;DTSTART=20171220T160000Z;UNTIL=20171230T160000Z',
        'EXDATE:20171224T160000Z,20171225T160000Z'
      ]
    }
    normedNonAllDay = {
      isAllDay: false,
      recurrence: [
        'RRULE:FREQ=DAILY;DTSTART=20171220T160000Z;UNTIL=20171230T160000Z',
        'EXDATE:20171224T160000Z,20171225T160000Z'
      ]
    }
  })

  it(`${e.normFromAllDayAttrs.name} should convert 'recurrence' to DATETIME format if isAllDay: true`, () => {
    expect(e.normFromAllDayAttrs(rawAllDay)).to.deep.equal({
      isAllDay: true,
      recurrence: [
        'RRULE:FREQ=DAILY;DTSTART=20171221T060000Z;UNTIL=20171231T060000Z',
        'EXDATE:20171225T060000Z,20171226T060000Z'
      ]
    })
  })

  it(`${e.normFromAllDayAttrs.name} should NOT convert 'recurrence' if isAllDay: false`, () => {
    expect(e.normFromAllDayAttrs(rawNonAllDay)).to.deep.equal(normedNonAllDay)
  })

  it(`${e.normFromAllDayAttrs.name} should reach fixpoint no later than the 1st call`, () => {
    const samples = [rawAllDay, rawNonAllDay]

    samples.forEach((sample) => {
      const firstResult = e.normFromAllDayAttrs(sample)
      const secondResult = e.normFromAllDayAttrs(firstResult)
      expect(secondResult).to.deep.equal(firstResult)
    })
  })

  it(`${e.normToAllDayAttrs.name} should convert 'recurrence' to DATE format if isAllDay: true`, () => {
    expect(e.normToAllDayAttrs(normedAllDay)).to.deep.equal(rawAllDay)
  })

  it(`${e.normToAllDayAttrs.name} should NOT convert 'recurrence' if isAllDay: false`, () => {
    expect(e.normToAllDayAttrs(normedNonAllDay)).to.deep.equal(normedNonAllDay)
  })

  it(`${e.normToAllDayAttrs.name} should reach fixpoint no later than the 1st call`, () => {
    const samples = [{}, normedNonAllDay, normedAllDay]

    samples.forEach((sample) => {
      const firstResult = e.normToAllDayAttrs(sample)
      const secondResult = e.normToAllDayAttrs(sample)
      expect(secondResult).to.deep.equal(firstResult)
    })
  })
})
