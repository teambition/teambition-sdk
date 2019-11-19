import { batchService, FallbackWhen } from '../../src/Net/batch'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'tman'
import { Observable, Scheduler } from 'rxjs'

type R = { result: { id: string, resource: any }[] }
interface RM {
  task: { resource: 'task', id: string }
  project: { resource: 'project', id: string }
}

describe('batch test', () => {
  let requestCalledLength = 0
  const requestMethod = (delay: number) => (resource: string, ids: string[]) => {
    requestCalledLength++
    return Observable.of({
      result: ids.map(id => ({ resource, id }))
    }).delay(delay)
  }
  const getMatched = (result: R, id: string) => {
    const matched = result.result.find(r => r.id === id)
    return matched
  }

  beforeEach(() => {
    requestCalledLength = 0
  })

  it('basic function', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { bufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '2').do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('fallback when alone', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { bufferTime: 1 })
    const fallback = { resource: 'task-fallback', id: '1' }

    yield batchRequest('task', '1', Observable.of(fallback), FallbackWhen.Alone)
      .do(res => {
        expect(res).to.deep.equal(fallback)
        expect(requestCalledLength).to.equal(0)
      })
  })

  it('fallback when error', function* () {
    const batchRequest = batchService<RM, R>(() => Observable.throw(Error('error')), getMatched, { bufferTime: 1 })
    const fallback = { resource: 'task-fallback', id: '1' }

    yield batchRequest('task', '1', Observable.of(fallback), FallbackWhen.Error)
      .do(res => {
        expect(res).to.deep.equal(fallback)
        expect(requestCalledLength).to.equal(0)
      })
  })

  it('should continue while requestMethod throw error', (done) => {
    const requestMethodError = (resource: string, ids: string[]) => {
      if (resource === 'task') {
        throw Error('error')
      }
      return requestMethod(0)(resource, ids)
    }
    const batchRequest = batchService<RM, R>(requestMethodError, getMatched, { bufferTime: 1 })
    let errorCount = 0

    Observable.forkJoin(
      batchRequest('task', '1').catch(() => {
        errorCount = 1
        return Observable.of({})
      }),
      batchRequest('project', '2').do(res => expect(res).to.deep.equal({ resource: 'project', id: '2' })),
      batchRequest('project', '3').do(res => expect(res).to.deep.equal({ resource: 'project', id: '3' })),
    ).subscribe(() => {
      expect(errorCount).to.equal(1)
      done()
    })
  })

  it('max buffer count', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { maxBufferCount: 2, bufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '2').do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('buffer time', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { bufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '2').do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      Observable.timer(2).take(1).switchMapTo(
        batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      )
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('buffer timer', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { bufferTimer: grouped => grouped.debounceTime(10) })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '2').do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      Observable.timer(5).take(1).switchMapTo(
        batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      ),
      Observable.timer(20).take(1).switchMapTo(
        batchRequest('task', '4').do(res => expect(res).to.deep.equal({ resource: 'task', id: '4' })),
      )
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('duplicate request', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(0), getMatched, { bufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('max concurrent', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(10), getMatched, { bufferTime: 10, maxConcurrent: 2 })
    const fallback2 = { resource: 'task-fallback', id: '2' }
    const fallback4 = { resource: 'task-fallback', id: '4' }

    yield Observable.forkJoin(
      batchRequest('task', '2', Observable.of(fallback2).delay(10))
        .do(res => expect(res).to.deep.equal({ resource: 'task-fallback', id: '2' })),
      Observable.timer(4).take(1).switchMapTo(
        batchRequest('task', '4', Observable.of(fallback4).delay(10))
          .do(res => expect(res).to.deep.equal({ resource: 'task-fallback', id: '4' })),
      ),
      Observable.timer(8).take(1).switchMapTo(
        batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      ),
      Observable.timer(10).take(1).switchMapTo(
        batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      ),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('duplicate request with reuse request', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(10), getMatched, { bufferTime: 5, maxBufferCount: 2 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '3').do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      Observable.timer(7).take(1).switchMapTo(
        batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      ),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('duplicate request wile not complete yet', function* () {
    const batchRequest = batchService<RM, R>(requestMethod(20), getMatched, { bufferTime: 5 })

    yield Observable.forkJoin(
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest('task', '1').do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })
})
