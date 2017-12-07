import { describe, it } from 'tman'
import { expect } from 'chai'
import * as Moment from 'moment'

import {
  recurrenceByMonth,
  recurrenceHasEnd,
  recurrenceStartAtAnExcludedDate,
  emptyRecurrence,
  normalEvent
} from '../../fixtures/events.fixture'

import { EventSDK as e } from '../../../src'
import { isAllDayLegacy } from '../../../src/apis/event/utils'
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

  it(`${isAllDayLegacy.name}() should return true for an event from 00:00 to 00:00 of the next day`, () => {
    expect(isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    } as any)).to.be.true
  })

  it(`${isAllDayLegacy.name}() should return true for an event from 00:00 to 00:00 of the next nth days`, () => {
    const nthDays = [3, 5, 7]

    nthDays.forEach((nthDay) => {
      expect(isAllDayLegacy({
        startDate: Moment(now).startOf('day').toISOString(),
        endDate: Moment(now).add(nthDay, 'day').startOf('day').toISOString()
      } as any)).to.be.true
    })
  })

  it(`${isAllDayLegacy.name}() should return false for an event from 00:00 to 00:00 of the same day`, () => {
    expect(isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).startOf('day').toISOString()
    } as any)).to.be.false
  })

  it(`${isAllDayLegacy.name}() should return false for an event from 00:00 to 23:59:999 of the same day`, () => {
    expect(isAllDayLegacy({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).endOf('day').toISOString()
    } as any)).to.be.false
  })

  it(`${isAllDayLegacy.name}() should return false for an event that doesn\'t start at 00:00`, () => {
    expect(isAllDayLegacy({
      startDate: Moment(now).startOf('day').add(1, 'hour').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').add(1, 'hour').toISOString()
    } as any)).to.be.false
  })

  it(`${e.dateToTime.name}() takes date info from input string, and returns zero o'clock of the date in current timezone in string`, () => {
    const expected = '2017-11-29T16:00:00.000Z'
    expect(e.dateToTime('2017-11-30')).to.equal(expected)
    expect(e.dateToTime('2017-11-30T00:00:00Z')).to.equal(expected)
    expect(e.dateToTime('2017-11-30T02:58:09.293Z')).to.equal(expected)
  })

  it(`${e.timeToDate.name}() takes from input string the date info as interpreted in current timezone, and returns it as 'YYYY-MM-DD'`, () => {
    expect(e.timeToDate('2017-11-29T16:00:00Z')).to.equal('2017-11-30')
    expect(e.timeToDate('2017-11-29T15:59:59Z')).to.equal('2017-11-29')
  })

  it('normFromAllDayAttrs() should return orginal startDate/endDate for object without allday info', () => {
    const startEndDate = {
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    }
    expect(e.normFromAllDayAttrs(startEndDate)).to.deep.equal(startEndDate)
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
      expect(isAllDayLegacy(normed)).to.be.true
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

  it('originEventId() should pick out origin event id from generated id', () => {
    const originId = recurrenceByMonth._id
    const gen = new e.Generator(recurrenceByMonth as any)

    for (let i = 0; i < 5; i++) {
      const { _id } = gen.next().value!
      expect(e.originEventId(_id)).to.equal(originId)
    }
  })

  it('originEventId() should return the id as it is if the id is original', () => {
    const originId = recurrenceByMonth._id
    const gen = new e.Generator(recurrenceByMonth as any)

    for (let i = 0; i < 5; i++) {
      const { _id } = gen.next().value!
      expect(e.originEventId(e.originEventId(_id))).to.equal(originId)
    }
  })
})
