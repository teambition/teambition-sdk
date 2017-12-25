import { describe, it, beforeEach } from 'tman'
import { expect } from 'chai'

import { api } from '../../../src/apis/event/iface'

import { clone } from '../../utils'

describe('Event API interface spec', () => {
  let response: any
  // let patch: any
  let parsedResponse: any

  beforeEach(() => {
    response = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      allDayStart: '2018-01-07',
      allDayEnd: '2018-01-07',
      title: 'non-allday'
    }
    parsedResponse = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      title: 'non-allday'
    }
  })

  it(`${api.parse.name}() doesn't modify input response`, () => {
    const responseClone = clone(response)

    api.parse(responseClone)

    expect(responseClone).to.deep.equal(response)
  })

  it(`${api.parse.name}() keeps original startDate/endDate for non-allday input`, () => {
    const parsed = api.parse(response)

    expect(parsed.startDate).to.equal(response.startDate)
    expect(parsed.endDate).to.equal(response.endDate)
  })

  it(`${api.parse.name}() drops allDayStart/allDayEnd from input`, () => {
    const parsed = api.parse(response)

    expect(parsed.hasOwnProperty('allDayStart')).to.be.false
    expect(parsed.hasOwnProperty('allDayEnd')).to.be.false
  })

  it(`${api.parse.name}() adjusts original startDate/endDate for allday input`, () => {
    const allDayResponse = { ...response, isAllDay: true }
    const parsed = api.parse(allDayResponse)

    expect(parsed.startDate).to.not.equal(allDayResponse.startDate)
    expect(parsed.endDate).to.not.equal(allDayResponse.endDate)

    // guard against startDate/endDate of `parsed` being non-valid date strings
    expect(new Date(parsed.startDate).valueOf()).to.be.greaterThan(0)
    expect(new Date(parsed.endDate).valueOf()).to.be.greaterThan(0)
  })

  it(`${api.parsePatch.name}() drops allDayStart/allDayEnd from patch`, () => {
    const patch = {
      isAllDay: true,
      startDate: '2018-01-08T07:00:00.000Z',
      endDate: '2018-01-08T07:30:00.000Z',
      allDayStart: '2018-01-08',
      allDayEnd: '2018-01-08',
    }
    const parsedPatch = api.parsePatch(patch, response)

    expect(parsedPatch.hasOwnProperty('allDayStart')).to.be.false
    expect(parsedPatch.hasOwnProperty('allDayEnd')).to.be.false
  })

  it(`${api.parsePatch.name}() keeps startDate/endDate from patch
  \tif target event is non-allday and patch.isAllDay is falsy, or
  \tif patch.isAllDay === false`, () => {
    const event1 = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      title: 'non-allday'
    }
    const patch1 = {
      startDate: '2018-01-08T07:00:00.000Z',
      endDate: '2018-01-08T07:30:00.000Z',
      allDayStart: '2018-01-08',
      allDayEnd: '2018-01-08',
    }
    const event2 = {
      isAllDay: true,
      startDate: '2018-01-07T05:00:00.000Z',
      endDate: '2018-01-08T05:00:00.000Z',
      title: 'allday'
    }
    const patch2 = { ...patch1, isAllDay: false }
    const sampleData = [[event1, patch1], [event2, patch2]]

    sampleData.forEach(([event, patch]) => {
      const parsedPatch = api.parsePatch(patch, event as any)
      expect(parsedPatch.startDate).to.equal(patch.startDate)
      expect(parsedPatch.endDate).to.equal(patch.endDate)
    })
  })

  it(`${api.parsePatch.name}() adjusts startDate/endDate from patch
  \tif the target event is allday and the patch doesn't set isAllDay, or
  \tif patch.isAllDay === true`, () => {
    const event1 = {
      isAllDay: true,
      startDate: '2018-01-07T05:00:00.000Z',
      endDate: '2018-01-08T05:00:00.000Z',
      title: 'allday'
    }
    const patch1 = {
      startDate: '2018-01-08T07:00:00.000Z',
      endDate: '2018-01-08T07:30:00.000Z',
      allDayStart: '2018-01-08',
      allDayEnd: '2018-01-08',
    }
    const event2 = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      title: 'non-allday'
    }
    const patch2 = { ...patch1, isAllDay: true }
    const sampleData = [[event1, patch1], [event2, patch2]]

    sampleData.forEach(([event, patch]) => {
      const parsedPatch = api.parsePatch(patch, event as any)

      expect(parsedPatch.startDate).to.not.equal(patch.startDate)
      expect(parsedPatch.endDate).to.not.equal(patch.endDate)

      // guard against startDate/endDate of `parsed` being non-valid date strings
      expect(new Date(parsedPatch.startDate!).valueOf()).to.be.greaterThan(0)
      expect(new Date(parsedPatch.endDate!).valueOf()).to.be.greaterThan(0)
    })
  })

  it(`${api.parsePatch.name}() doesn't modify input patch`, () => {
    const patch = { endDate: '2018-01-08T07:30:00.000Z', allDayEnd: '2018-01-08' }
    const patchClone = clone(patch)

    api.parsePatch(patchClone, response)

    expect(patchClone).to.deep.equal(patch)
  })

  it(`${api.parsePatch.name}() passes through no-need-to-be-parsed patchs`, () => {
    const noNeedToBeParsedPatches = [{}, { title: 'new title' }]
    noNeedToBeParsedPatches.forEach((passThroughPatch) => {
      const patchClone = clone(passThroughPatch)
      expect(api.parsePatch(passThroughPatch, response)).to.deep.equal(patchClone)
    })
  })

  it(`${api.deparse.name}() doesn't modify input model`, () => {
    const parsedResonseClone = clone(parsedResponse)

    api.deparse(parsedResonseClone)

    expect(parsedResonseClone).to.deep.equal(parsedResponse)
  })

  it(`${api.deparse.name}() adds back allDayStart/allDayEnd and drops startDate/endDate for allday model`, () => {
    const model = {
      isAllDay: true,
      startDate: '2018-01-07T05:00:00.000Z',
      endDate: '2018-01-08T05:00:00.000Z',
      title: 'allday'
    }
    const deparsed = api.deparse(model as any)

    expect(deparsed.allDayStart).to.equal('2018-01-07')
    expect(deparsed.allDayEnd).to.equal('2018-01-07')
    expect(deparsed.hasOwnProperty('startDate')).to.be.false
    expect(deparsed.hasOwnProperty('endDate')).to.be.false
  })

  it(`${api.deparse.name}() keeps startDate/endDate for non-allday model`, () => {
    const deparsed = api.deparse(parsedResponse)

    expect(deparsed.startDate).to.equal(parsedResponse.startDate)
    expect(deparsed.endDate).to.equal(parsedResponse.endDate)
  })

  it(`${api.deparsePatch.name}() doesn't modify input patch`, () => {
    const nonAllDayEvent = parsedResponse
    const nonAllDayPatch = { endDate: '2018-01-08T07:30:00.000Z' }
    const allDayEvent = { ...nonAllDayEvent, isAllDay: true, title: 'allday' }
    const allDayPatch = { endDate: '2018-01-08T05:00:00.000Z' }
    const sampleData = [[nonAllDayEvent, nonAllDayPatch], [allDayEvent, allDayPatch]]

    sampleData.forEach(([event, patch]) => {
      const patchClone = clone(patch)

      api.deparsePatch(patchClone, event)

      expect(patchClone).to.deep.equal(patch)
    })
  })

  it(`${api.deparsePatch.name}() keeps startDate/endDate from patch
  \tif target event is non-allday and patch.isAllDay is falsy, or
  \tif patch.isAllDay === false`, () => {
    const event1 = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      title: 'non-allday'
    }
    const patch1 = {
      startDate: '2018-01-08T07:00:00.000Z',
      endDate: '2018-01-08T07:30:00.000Z',
    }
    const event2 = {
      isAllDay: true,
      startDate: '2018-01-07T05:00:00.000Z',
      endDate: '2018-01-08T05:00:00.000Z',
      title: 'allday'
    }
    const patch2 = { ...patch1, isAllDay: false }
    const sampleData = [[event1, patch1], [event2, patch2]]

    sampleData.forEach(([event, patch]) => {
      const deparsedPatch = api.deparsePatch(patch, event as any)
      expect(deparsedPatch.startDate).to.equal(patch.startDate)
      expect(deparsedPatch.endDate).to.equal(patch.endDate)
    })
  })

  it(`${api.deparsePatch.name}() replaces startDate/endDate with allDayStart/allDayEnd
  \tif fi the target event is allday and the patch doesn't set isAllDay, or
  \tif patch.isAllDay ===true`, () => {
    const event1 = {
      isAllDay: true,
      startDate: '2018-01-07T05:00:00.000Z',
      endDate: '2018-01-08T05:00:00.000Z',
      title: 'allday'
    }
    const patch1 = {
      startDate: '2018-01-08T05:00:00.000Z',
      endDate: '2018-01-09T05:00:00.000Z'
    }
    const event2 = {
      isAllDay: false,
      startDate: '2018-01-07T07:00:00.000Z',
      endDate: '2018-01-07T07:30:00.000Z',
      title: 'non-allday'
    }
    const patch2 = { ...patch1, isAllDay: true }
    const sampleData = [[event1, patch1], [event2, patch2]]

    sampleData.forEach(([event, patch]) => {
      const deparsedPatch = api.deparsePatch(patch, event as any)

      expect(deparsedPatch.hasOwnProperty('startDate')).to.be.false
      expect(deparsedPatch.hasOwnProperty('endDate')).to.be.false

      expect(deparsedPatch.allDayStart).to.equal('2018-01-08')
      expect(deparsedPatch.allDayEnd).to.equal('2018-01-08')
    })
  })

})
