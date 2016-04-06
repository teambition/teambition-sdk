'use strict'
import * as chai from 'chai'
import {Backend, UserAPI, forEach, clone} from '../'
import {apihost} from '../app'
import {userMe} from '../mock/userme'
import {UserMe} from '../type'

const expect = chai.expect

const User = new UserAPI()

export default describe('UserAPI test', () => {

  let httpBackend: Backend

  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend.whenGET(`${apihost}/users/me`).respond(userMe)
  })

  it('get user me should ok', done => {
    User.getUserMe()
    .then(data => {
      forEach(userMe, (value: any, key: string) => {
        expect(userMe[key]).deep.equal(data[key])
      })
      done()
    })
    httpBackend.flush()
  })

  it('update user me should ok', (done: Function) => {
    let me: UserMe
    const mockPut = clone(userMe)
    mockPut.name = 'test'

    httpBackend
    .whenPUT(`${apihost}/users`, {
      name: 'test'
    }).respond(mockPut)

    User.getUserMe()
    .then(data => {
      me = data
      return User.update({
        name: 'test'
      })
    })
    .then(() => {
      return User.getUserMe()
    })
    .then(data => {
      expect(data.name).to.equal('test')
      expect(me.name).to.equal('test')
      done()
    })
    setTimeout(() => {
      httpBackend.flush()
    }, 500)
  })

  it('add email should ok', done => {
    const mockResponse = clone(userMe)
    const updateData = {
      email: 'test@teambition.com',
      state: 1,
      _id: '54cb6200d1b4c6af47abe111',
      id: '54cb6200d1b4c6af47abe111'
    }
    let me: UserMe
    mockResponse.emails = mockResponse.emails.concat([updateData])
    httpBackend.whenPOST(`${apihost}/users/email`, {
      email: updateData.email
    }).respond(mockResponse.emails)

    User.getUserMe()
    .then(data => {
      me = data
      return User.addEmail(updateData.email)
    })
    .then(() => {
      return User.getUserMe()
    })
    .then(data => {
      expect(me.emails.length).to.equal(2)
      expect(me.emails[1]).to.deep.equal(updateData)
      expect(data.emails.length).to.equal(2)
      expect(data.emails[1]).to.deep.equal(updateData)
      done()
    })
    .catch(reason => {
      console.error(reason)
    })

    httpBackend.flush()

  })

  it('bind phone should ok', done => {
    const mockResponse = clone(userMe)
    const updateData = {
      phone: '13334444555',
      vcode: '4843'
    }
    let me: UserMe
    mockResponse.phone = updateData.phone
    httpBackend
    .whenPUT(`${apihost}/users/phone`, updateData)
    .respond(mockResponse)

    User.getUserMe().then(data => {
      me = data
      return User.bindPhone(updateData.phone, updateData.vcode)
    })
    .then(() => {
      return User.getUserMe()
    })
    .then(data => {
      expect(me.phone).to.equal(updateData.phone)
      expect(data.phone).to.equal(updateData.phone)
      done()
    })

    httpBackend.flush()

  })
})
