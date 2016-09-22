'use strict'
import * as chai from 'chai'
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
  })

  it('update user me should ok', function* () {
    const mockPut = clone(userMe)
    mockPut.name = 'test'

    httpBackend
      .whenPUT(`${apihost}users`, {
        name: 'test'
      }).respond(JSON.stringify(mockPut))

    const signal = User.getUserMe()
      .publish()
      .refCount()

    yield signal.take(1)

    yield User.update({
      name: 'test'
    })
      .do(r => {
        expect(r).to.deep.equal(mockPut)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.name).to.equal('test')
      })

  })

  it('add email should ok', function* () {
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

    const signal = User.getUserMe()
      .publish()
      .refCount()

    yield signal.take(1)

    yield User.addEmail(updateData.email)
      .do(r => {
        expect(r).to.deep.equal({
          emails: mockResponse.emails
        })
      })

    yield signal.take(1)
      .do(data => {
        expect(data.emails.length).to.equal(2)
        expect(data.emails[1]).to.deep.equal(updateData)
      })

  })

  it('bind phone should ok', function* () {
    const mockResponse = clone(userMe)
    const updateData = {
      phone: '13345678999',
      vcode: '4843'
    }
    mockResponse.phone = updateData.phone

    httpBackend
      .whenPUT(`${apihost}users/phone`, updateData)
      .respond(JSON.stringify(mockResponse))

    const signal = User.getUserMe()
      .publish()
      .refCount()

    yield signal.take(1)
      .do(data => {
        expect(data.phone).to.equal('')
      })

    yield User.bindPhone(updateData.phone, updateData.vcode)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.phone).to.equal(updateData.phone)
      })

  })
})
