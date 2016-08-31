'use strict'
import * as chai from 'chai'
import { Subscription } from 'rxjs/Subscription'
import { Fetch, Backend, HttpError$ } from '../index'

const expect = chai.expect

export default describe('HttpError$ test: ', () => {
  let httpBackend: Backend
  let mockFetch: Fetch
  let apiHost: string
  let stream: Subscription

  beforeEach(() => {
    httpBackend = new Backend()
    mockFetch = new Fetch()
    apiHost = mockFetch.getAPIHost()
  })

  afterEach(() => {
    stream.unsubscribe()
  })

  it('handler error should ok', done => {
    httpBackend.whenGET(`${apiHost}users/me`)
      .error('Bad Request', {
        status: 400
      })

    stream = HttpError$.map(r => {
      return r.error.body
    })
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get('users/me')

    httpBackend.flush()
  })

  it('handler sequence error should ok', done => {

    httpBackend.whenGET(`${apiHost}users/me`)
      .error('Bad Request', {
        status: 400
      })

    httpBackend.whenGET(`${apiHost}users/me`)
      .error('Bad Request', {
        status: 400
      })

    stream = HttpError$
      .map(r => r.error.body)
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get('users/me')

    mockFetch.get('users/me')

    httpBackend.flush()
  })
})
