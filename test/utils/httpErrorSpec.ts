'use strict'
import * as chai from 'chai'
import { describe, it, beforeEach } from 'tman'
import { Fetch, Backend, HttpError$ } from '../index'

const expect = chai.expect

export default describe('HttpError$ test: ', () => {
  let httpBackend: Backend
  let mockFetch: Fetch
  let apiHost: string

  beforeEach(() => {
    httpBackend = new Backend()
    mockFetch = new Fetch()
    apiHost = mockFetch.getAPIHost()
  })

  it('handler error should ok', done => {
    httpBackend.whenGET(`${apiHost}users/me`)
      .error('Bad Request', {
        status: 400
      })

    HttpError$.map(r => {
      return r.error.statusText
    })
      .take(1)
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get('users/me').subscribe()
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

    HttpError$.skip(1)
      .take(1)
      .map(r => r.error.statusText)
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get('users/me').subscribe()

    mockFetch.get('users/me').subscribe()
  })
})
