import { batchService, FallbackWhen } from '../../src/Net/batch'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'tman'
import { Observable, Scheduler } from 'rxjs'

describe('batch test', () => {
  let requestCalledLength = 0
  const requestMethod = (delay: number) => ({ resource, ids }: { resource: string, ids: string[] }) => {
    requestCalledLength++
    return Observable.of({
      result: ids.map(id => ({ resource, id }))
    }).delay(delay)
  }
  const getMatched = <T>(result: { result: { id: string }[] }, id: string) => {
    const matched = result.result.find(r => r.id === id)
    return matched as any as T | undefined
  }

  beforeEach(() => {
    requestCalledLength = 0
  })

  it('basic function', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { defaultBufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '2' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('fallback when alone', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { defaultBufferTime: 1 })
    const fallback = { resource: 'task-fallback', id: '1' }

    yield batchRequest({ resource: 'task', id: '1' }, Observable.of(fallback), FallbackWhen.Alone)
      .do(res => {
        expect(res).to.deep.equal(fallback)
        expect(requestCalledLength).to.equal(0)
      })
  })

  it('fallback when error', function* () {
    const batchRequest = batchService(() => Observable.throw(Error('error')), getMatched, { defaultBufferTime: 1 })
    const fallback = { resource: 'task-fallback', id: '1' }

    yield batchRequest({ resource: 'task', id: '1' }, Observable.of(fallback), FallbackWhen.Error)
      .do(res => {
        expect(res).to.deep.equal(fallback)
        expect(requestCalledLength).to.equal(0)
      })
  })

  it('should continue while requestMethod throw error', (done) => {
    const requestMethodError = ({ resource, ids }: any) => {
      if (resource === 'task') {
        throw Error('error')
      }
      return requestMethod(0)({ resource, ids })
    }
    const batchRequest = batchService(requestMethodError, getMatched, { defaultBufferTime: 1 })
    let errorCount = 0

    Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).catch(() => {
        errorCount = 1
        return Observable.of({})
      }),
      batchRequest({ resource: 'project', id: '2' }).do(res => expect(res).to.deep.equal({ resource: 'project', id: '2' })),
      batchRequest({ resource: 'project', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'project', id: '3' })),
    ).subscribe(() => {
      expect(errorCount).to.equal(1)
      done()
    })
  })

  it('max buffer count', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { maxBufferCount: 2, defaultBufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '2' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('buffer time', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { defaultBufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '2' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      Observable.timer(2).take(1).switchMapTo(
        batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      )
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('buffer timer', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { bufferTimer: grouped => grouped.debounceTime(3) })

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '2' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '2' })),
      Observable.timer(2).take(1).switchMapTo(
        batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      ),
      Observable.timer(8).take(1).switchMapTo(
        batchRequest({ resource: 'task', id: '4' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '4' })),
      )
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(2)
      })
  })

  it('duplicate request', function* () {
    const batchRequest = batchService(requestMethod(0), getMatched, { defaultBufferTime: 1 })

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })

  it('duplicate request with fallback alone', function* () {
    let count = 3
    const requestMethodDelay = (params: any) => {
      return requestMethod((count--) * 5)(params)
    }
    const batchRequest = batchService(requestMethodDelay, getMatched, { defaultBufferTime: 2, maxBufferCount: 2 })
    const fallback = { resource: 'task-fallback', id: '1' }

    yield Observable.forkJoin(
      batchRequest({ resource: 'task', id: '1' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '1' })),
      batchRequest({ resource: 'task', id: '3' }).do(res => expect(res).to.deep.equal({ resource: 'task', id: '3' })),
      batchRequest({ resource: 'task', id: '1' }, Observable.of(fallback))
        .do(res => expect(res).to.deep.equal({ resource: 'task-fallback', id: '1' })),
    ).subscribeOn(Scheduler.asap)
      .do(() => {
        expect(requestCalledLength).to.equal(1)
      })
  })
})
