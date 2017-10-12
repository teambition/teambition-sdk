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

  it('isAllDay() should return true for an event from 00:00 to 00:00 of the next day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day'),
      endDate: Moment(now).add(1, 'day').startOf('day')
    } as any)).to.be.true
  })

  it('isAllDay() should return true for an event from 00:00 to 00:00 of the next nth days', () => {
    const nthDays = [3, 5, 7]

    nthDays.forEach((nthDay) => {
      expect(e.isAllDay({
        startDate: Moment(now).startOf('day'),
        endDate: Moment(now).add(nthDay, 'day').startOf('day')
      } as any)).to.be.true
    })
  })

  it('isAllDay() should return false for an event from 00:00 to 00:00 of the same day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day'),
      endDate: Moment(now).startOf('day')
    } as any)).to.be.false
  })

  it('isAllDay() should return false for an event from 00:00 to 23:59:999 of the same day', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day'),
      endDate: Moment(now).endOf('day')
    } as any)).to.be.false
  })

  it('isAllDay() should return false for an event that doesn\'t start at 00:00', () => {
    expect(e.isAllDay({
      startDate: Moment(now).startOf('day').add(1, 'hour'),
      endDate: Moment(now).add(1, 'day').startOf('day').add(1, 'hour')
    } as any)).to.be.false
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
