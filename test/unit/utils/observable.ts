'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import * as chai from 'chai'

const expect = chai.expect

export default describe('Observable monkeypatch test: ', () => {
  it('when next, loading$ stream should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      observer.next('hello')
    })
    const loading$ = stream.loading$
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    expect(loading).to.be.true

    stream.subscribe(() => {
      expect(loading).to.be.false
      done()
    })
  })

  it('when error, loading$ stream should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      observer.error(new Error('not happy'))
    })
    const loading$ = stream.loading$
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    expect(loading).to.be.true

    stream.subscribe({
      error: (err: Error) => {
        expect(err.message).to.equal('not happy')
        expect(loading).to.be.false
        done()
      }
    })
  })

  it('loading$ in async stream should ok', done => {
    const stream = Observable.create((observer: Observer<string>) => {
      setTimeout(() => {
        observer.next('hello')
      }, global.timeout2)
    })
    const loading$ = stream.loading$
    let loading = true

    loading$.subscribe(r => {
      loading = r
    })

    setTimeout(() => {
      expect(loading).to.be.true
    }, global.timeout1)

    stream.subscribe(() => {
      expect(loading).to.be.false
      done()
    })
  })
})
