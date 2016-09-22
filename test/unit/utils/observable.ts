'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import * as chai from 'chai'

const expect = chai.expect

export default describe('Observable toLoading test: ', () => {
  it('toLoading should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      observer.next('hello')
    })
    const loading$ = stream.toLoading()
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    stream.subscribe(() => {
      expect(loading).to.be.false
      done()
    })
  })

  it('when error, toLoading should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      observer.error(new Error('not happy'))
    })
    const loading$ = stream.toLoading()
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    stream.subscribe({
      error: (err: Error) => {
        expect(err.message).to.equal('not happy')
        expect(loading).to.be.false
        done()
      }
    })
  })

  it('toLoading an async stream should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      setTimeout(() => {
        observer.next('hello')
      }, 200)
    })
    const loading$ = stream.toLoading()
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    setTimeout(() => {
      expect(loading).to.be.true
    }, 100)

    stream.subscribe(() => {
      expect(loading).to.be.false
      done()
    })
  })
})
