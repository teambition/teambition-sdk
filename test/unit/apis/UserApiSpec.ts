'use strict'
import * as chai from 'chai'
import * as Rx from 'rxjs'
import { Backend, UserAPI, forEach, clone, apihost } from '../index'
import { userMe } from '../../mock/userme'
import { flush } from '../utils'

const expect = chai.expect

export default describe('UserAPI test', () => {

  let httpBackend: Backend
  let User: UserAPI

  beforeEach(() => {
    flush()
    User = new UserAPI()
    httpBackend = new Backend()

    httpBackend
      .whenGET(`${apihost}users/me`)
      .respond(JSON.stringify(userMe))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get user me should ok', done => {
    User.getUserMe()
      .subscribe(data => {
        forEach(userMe, (value: any, key: string) => {
          expect(userMe[key]).deep.equal(data[key])
        })
        done()
      })

    httpBackend.flush()
  })

  it('update user me should ok', done => {
    const mockPut = clone(userMe)
    mockPut.name = 'test'

    httpBackend
      .whenPUT(`${apihost}users`, {
        name: 'test'
      }).respond(JSON.stringify(mockPut))

    const get = User.getUserMe()

    get.skip(1)
      .subscribe(r => {
        expect(r.name).to.equal('test')
        done()
      })

    User.update({
      name: 'test'
    }).subscribeOn(Rx.Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()

  })

  it('add email should ok', done => {
    const mockResponse = clone(userMe)
    const updateData = {
      email: 'test@teambition.com',
      state: 1,
      _id: '54cb6200d1b4c6af47abe111',
      id: '54cb6200d1b4c6af47abe111'
    }

    mockResponse.emails = mockResponse.emails.concat([updateData])
    httpBackend.whenPOST(`${apihost}users/email`, {
      email: updateData.email
    })
      .respond(JSON.stringify(mockResponse.emails))

    const get = User.getUserMe()
    const add = User.addEmail(updateData.email)

    get.skip(1)
      .subscribe(data => {
        expect(data.emails.length).to.equal(2)
        expect(data.emails[1]).to.deep.equal(updateData)
        done()
      }, err => console.error(err))

    add.subscribeOn(Rx.Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()

  })

  it('bind phone should ok', done => {
    const mockResponse = clone(userMe)
    const updateData = {
      phone: '13334444555',
      vcode: '4843'
    }
    mockResponse.phone = updateData.phone

    httpBackend
      .whenPUT(`${apihost}users/phone`, updateData)
      .respond(JSON.stringify(mockResponse))

    const get = User.getUserMe()
    const bind = User.bindPhone(updateData.phone, updateData.vcode)

    let times = 0

    get.subscribe(data => {
      switch (++times) {
        case 1:
          expect(data.phone).to.equal('')
          break
        case 2:
          expect(data.phone).to.equal(updateData.phone)
          done()
          break
      }
    })

    bind.subscribeOn(Rx.Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()

  })
})
