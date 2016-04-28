'use strict'
import * as chai from 'chai'
import {Backend, UserAPI, forEach, clone} from '../index'
import {flushDatabase} from '../utils'
import {apihost} from '../index'
import {userMe} from '../mock/userme'

const expect = chai.expect

export default describe('UserAPI test', () => {

  let httpBackend: Backend
  let User: UserAPI

  beforeEach(() => {
    User = new UserAPI()
    httpBackend = new Backend()
    flushDatabase()
    httpBackend.whenGET(`${apihost}/users/me`).respond(userMe)
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
    .whenPUT(`${apihost}/users`, {
      name: 'test'
    }).respond(mockPut)

    const get = User.getUserMe()
    const update = User.update({
      name: 'test'
    })

    get.concatMap(x => {
      expect(x.name).to.equal(userMe.name)
      return update
    })
    .concatMap(x => get)
    .subscribe(r => {
      expect(r.name).to.equal('test')
      done()
    })

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
    httpBackend.whenPOST(`${apihost}/users/email`, {
      email: updateData.email
    }).respond(mockResponse.emails)

    const get = User.getUserMe()
    const add = User.addEmail(updateData.email)

    let times = 0

    get.subscribe(data => {
      switch (++times) {
        case 1:
          expect(data.emails.length).to.equal(1)
          break
        case 2:
          expect(data.emails.length).to.equal(2)
          expect(data.emails[1]).to.deep.equal(updateData)
          done()
          break
      }
    })

    add.subscribe()

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
    .whenPUT(`${apihost}/users/phone`, updateData)
    .respond(mockResponse)

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

    bind.subscribe()

    httpBackend.flush()

  })
})
