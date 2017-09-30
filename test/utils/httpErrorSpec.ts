import * as chai from 'chai'
import { Observable, Scheduler, Subject } from 'rxjs'
import { describe, it, beforeEach, afterEach } from 'tman'

import { Http, Backend, HttpErrorMessage } from '../index'

const expect = chai.expect

export default describe('HttpError$ test: ', () => {
  const url = 'www.example.com'

  const silentRequest = (req: Http<any>) =>
    req.get().send().catch(() => Observable.of(null))

  let httpBackend: Backend
  let mockFetch: Http<any>
  let error$: Subject<HttpErrorMessage>

  beforeEach(() => {
    error$ = new Subject<HttpErrorMessage>()
    httpBackend = new Backend()
    mockFetch = new Http(url, error$)
  })

  afterEach(() => {
    httpBackend.restore()
  })

  it('handler error should ok', function* () {
    httpBackend.whenGET(url)
      .error('testing', {
        status: 400
      })

    yield Observable.zip(
      silentRequest(mockFetch),
      error$,
      (_, { error }) => error
    )
      .subscribeOn(Scheduler.asap)
      .do(({ statusText, body }) => {
        expect(statusText).to.equal('Bad Request')
        expect(body).equal('testing')
      })
  })

  it('handler sequence error should ok', function* () {
    httpBackend.whenGET(url)
      .error('testing 1', {
        status: 400
      })

    httpBackend.whenGET(url)
      .error('testing 2', {
        status: 400
      })

    yield Observable.zip(
      silentRequest(mockFetch).concat(silentRequest(mockFetch)),
      error$,
      (_, { error }) => error
    )
      .skip(1)
      .subscribeOn(Scheduler.asap)
      .do(({ statusText, body }) => {
        expect(statusText).to.equal('Bad Request')
        expect(body).to.equal('testing 2')
      })
  })
})
