'use strict'
import * as chai from 'chai'
import {Backend, UserAPI, forEach, clone} from '../'
import {apihost} from '../app'
import {userMe} from '../mock'
import {IUserMe} from 'teambition'

const expect = chai.expect

export default describe('UserAPI test', () => {

  let httpBackend: Backend

  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend.whenGET(`${apihost}/users/me`).respond(userMe)
  })

  it('get user me should ok', (done: Function) => {
    UserAPI.getUserMe().then((data: IUserMe) => {
      forEach(userMe, (value: any, key: string) => {
        expect(userMe[key]).deep.equal(data[key])
      })
      done()
    })
    httpBackend.flush()
  })

  it('update user me should ok', (done: Function) => {
    let me: IUserMe
    const mockPut = clone({}, userMe)
    mockPut.name = 'test'

    httpBackend.whenPUT(`${apihost}/users/me`, {
      name: 'test'
    }).respond(mockPut)

    UserAPI.getUserMe().then((data: IUserMe) => {
      me = data
      return UserAPI.update({
        name: 'test'
      })
    })
    .then(() => {
      return UserAPI.getUserMe()
    })
    .then((data: IUserMe) => {
      expect(data.name).to.equal('test')
      expect(me.name).to.equal('test')
      done()
    })

    httpBackend.flush()
  })
})
