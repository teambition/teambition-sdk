'use strict'
import * as chai from 'chai'
import {createNewsignal, flushsignals} from '../index'

const expect = chai.expect

describe('signals test', () => {
  beforeEach(() => {
    flushsignals()

    createNewsignal('1', 'set', {
      _id: '1',
      name: 'teambition'
    })

    createNewsignal('1', 'update', {
      _id: '1',
      name: 'teambition frontend team'
    })

    createNewsignal('1', 'delete', null)

  })

  it('create new signal should ok', () => {
    createNewsignal('xx', 'set', {
      _id: 'xx',
      name: 'tbsdk'
    })
    .subscribe(data => {
      expect(data.name).to.equal('tbsdk')
    })
  })

  it('create new signal that should merge to old one', (done) => {

    let getSignalTimes = 0

    const Signal = createNewsignal('xx', 'set', {
      _id: 'xx',
      name: 'tbsdk'
    })

    Signal.subscribe(data => {
      getSignalTimes ++
      if (getSignalTimes === 2) done()
    })

    createNewsignal('xx', 'set', {
      _id: 'xx',
      price: 2000
    })
  })

})
