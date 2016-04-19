'use strict'
import * as chai from 'chai'
import {createNewsignal, getSignal, getSignalsById, getSignalsByIds, flushsignals} from '../index'

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

  it('get signal should ok', () => {
    getSignal('1', 'set')
      .subscribe(data => {
        expect(data._id).to.equal('1')
        expect(data.name).to.equal('teambition')
      })
  })

  it('create signal to exists signal should ok', (done) => {
    createNewsignal('1', 'set', {
      id: '1',
      orgs: 'huiyi'
    })

    let getSignalTimes = 0

    getSignal('1', 'set')
      .subscribe(data => {
        getSignalTimes ++
        if (data.name) {
          expect(data.name).to.equal('teambition')
        }
        if (data.orgs) {
          expect(data.orgs).to.equal('huiyi')
        }
        if (getSignalTimes === 2) done()
      })

  })

  it('getsignalsById should ok', () => {
    let getSignalTimes = 0

    getSignalsById('1')
      .subscribe(data => {
        getSignalTimes ++
      })
    expect(getSignalTimes).to.equal(3)
  })

  it('getsignalsByIds should ok', () => {

    let getSignalTimes = 0

    createNewsignal('2', 'set', {
      _id: '2',
      name: 'talk'
    })

    createNewsignal('2', 'update', {
      _id: '2',
      name: 'talk frontend team'
    })

    createNewsignal('2', 'delete', null)

    getSignalsByIds(['1', '2'])
      .subscribe(data => {
        getSignalTimes ++
      })

    expect(getSignalTimes).to.equal(6)
  })
})
