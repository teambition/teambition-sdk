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

  it('LEGACY isAllDay() should return true for an event from 00:00 to 00:00 of the next day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    } as any)).to.be.true
  })

  it('LEGACY isAllDay() should return true for an event from 00:00 to 00:00 of the next nth days', () => {
    const nthDays = [3, 5, 7]

    nthDays.forEach((nthDay) => {
      expect(e.isAllDay({
        startDate: Moment(now).startOf('day').toISOString(),
        endDate: Moment(now).add(nthDay, 'day').startOf('day').toISOString()
      } as any)).to.be.true
    })
  })

  it('LEGACY isAllDay() should return false for an event from 00:00 to 00:00 of the same day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).startOf('day').toISOString()
    } as any)).to.be.false
  })

  it('LEGACY isAllDay() should return false for an event from 00:00 to 23:59:999 of the same day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).endOf('day').toISOString()
    } as any)).to.be.false
  })

  it('LEGACY isAllDay() should return false for an event that doesn\'t start at 00:00', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day').add(1, 'hour').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').add(1, 'hour').toISOString()
    } as any)).to.be.false
  })

  it('allDayEventStartEndDate() should return orginal startDate/endDate for object without allday info', () => {
    const startEndDate = {
      startDate: Moment(now).startOf('day').toISOString(),
      endDate: Moment(now).add(1, 'day').startOf('day').toISOString()
    }
    expect(e.allDayEventStartEndDate(startEndDate as any)).to.deep.equal(startEndDate)
  })

  it('allDayEventStartEndDate() should return valid allday event startDate/endDate when provided with allday info', () => {
    const allDayInfos = [1, 2, 3].map((nth) => ({
      isAllDay: true,
      allDayStart: '2017-10-10',
      allDayEnd: '2017-10-1' + nth
    }))

    allDayInfos.forEach((allDayInfo) => {
      expect(e.isAllDay(e.allDayEventStartEndDate(allDayInfo as any) as any)).to.be.true
    })
  })

  it('normAllDayEventStartEndDateUpdate() should return normalized date info', () => {
    expect(e.normAllDayEventStartEndDateUpdate({
      startDate: '2017-10-31T16:00:00.000-08:00',
      endDate: '2017-11-01T16:00:00.000-08:00'
    })).to.deep.equal({
      startDate: '2017-11-01T00:00:00.000Z',
      endDate: '2017-11-02T00:00:00.000Z',
      allDayStart: '2017-11-01',
      allDayEnd: '2017-11-02'
    })

    expect(e.normAllDayEventStartEndDateUpdate({
      startDate: '2017-10-31T16:00:00.000-08:00',
      endDate: '2017-11-03T16:00:00.000-08:00'
    })).to.deep.equal({
      startDate: '2017-11-01T00:00:00.000Z',
      endDate: '2017-11-04T00:00:00.000Z',
      allDayStart: '2017-11-01',
      allDayEnd: '2017-11-04'
    })
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
