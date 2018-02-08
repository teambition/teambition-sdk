import { describe, it, beforeEach, afterEach } from 'tman'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { clone } from '../utils'
import * as midware from '../../src/sockets/Middleware'
import { Logger } from 'reactivedb'
import { marbles } from 'rxjs-marbles'

const CF = midware.ControlFlow

describe('Socket interceptor creator', () => {

  let msg: any
  let msgClone: any
  let errStub: any
  const simpleTransFn = (message: any) => {
    message.data.key = 'hello'
  }

  beforeEach(() => {
    msg = {
      method: 'change',
      id: '1234567890',
      type: 'event',
      data: { key: 'value' }
    }
    msgClone = clone(msg)
    const logger = Logger.get('teambition-sdk')
    errStub = sinon.stub(logger, 'error')
  })

  afterEach(() => {
    errStub.restore()
  })

  it('no flag', () => {
    const interceptor: any = midware.createInterceptor(simpleTransFn)

    interceptor(msg)

    expect(msg).to.deep.equal(msgClone)
    expect(errStub).to.called
  })

  it('shortCircuit', () => {
    const interceptor: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return CF.ShortCircuit
    })

    const result = interceptor(msg)

    expect(result).to.equal(CF.ShortCircuit)
    expect(msg).to.deep.equal(msgClone)
    expect(errStub).to.called
  })

  it('mutateMessage', () => {
    const interceptor: any = midware.createInterceptor(simpleTransFn, { mutate: true })

    interceptor(msg)

    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('shortCircuit + mutateMessage', () => {
    const interceptor: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return CF.ShortCircuit
    }, {
      mutate: true
    })

    const result = interceptor(msg)

    expect(result).to.equal(CF.ShortCircuit)
    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('shortCircuit and Observable', () => {
    const expectedResult = { say: 'hello' }
    const interceptor: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return Observable.of(expectedResult)
    })

    const result = interceptor(msg)

    expect(msg).to.deep.equal(msgClone)
    expect(errStub).to.called
    return (result as Observable<any>).do((x) => {
      expect(x).to.deep.equal(expectedResult)
    })
  })

  it('mutateMessage + Observable', () => {
    const expectedResult = { say: 'world' }
    const intercept: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return Observable.of(expectedResult)
    }, {
      mutate: true
    })

    const result = intercept(msg)

    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
    return (result as Observable<any>).do((x) => {
      expect(x).to.deep.equal(expectedResult)
    })
  })
})

describe('Socket Interceptors', () => {

  let interceptors: any
  let msg: any
  let msgClone: any
  let errStub: any

  const transDataKey = (message: any) => {
    message.data.key = 'hello'
  }
  const transType = (message: any) => {
    message.type = 'Event'
  }

  beforeEach(() => {
    interceptors = new midware.Interceptors()
    msg = {
      method: 'change',
      id: '1234567890',
      type: 'event',
      data: { key: 'value' }
    }
    msgClone = clone(msg)
    const logger = Logger.get('teambition-sdk')
    errStub = sinon.stub(logger, 'error')
  })

  afterEach(() => {
    errStub.restore()
  })

  it('should passthrough when no interceptor is registered', () => {
    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.PassThrough)
    expect(msg).to.deep.equal(msgClone)
  })

  it('should passthrough when all interceptors are passthroughs: without message mutation', () => {
    interceptors.append(transDataKey)
    interceptors.append(transType)

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.PassThrough)
    expect(msg).to.deep.equal(msgClone)
    expect(errStub).calledTwice
  })

  it('should passthrough when all interceptors are passthroughs: with message mutation', () => {
    interceptors.append(transDataKey, { mutate: true })
    interceptors.append(transType, { mutate: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.PassThrough)
    expect(msg.type).to.equal('Event')
    expect(msg.data.key).to.equal('hello')

    msg.type = 'event'
    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('should shortcircuit when an interceptor returns ShortCircuit flag', () => {
    interceptors.append((message: any) => {
      transDataKey(message)
      return CF.ShortCircuit
    }, { mutate: true })
    interceptors.append(transType, { mutate: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.ShortCircuit)
    expect(msg.data.key).to.equal('hello')
    expect(msg.type).to.equal('event')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('should shortcircuit when an interceptor returns an Observable', () => {
    interceptors.append((message: any) => {
      transDataKey(message)
      return Observable.of(null)
    }, { mutate: true })
    interceptors.append(transType, { mutate: true })

    interceptors.apply(msg)

    expect(msg.data.key).to.equal('hello')
    expect(msg.type).to.equal('event')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

})

describe('Socket Proxy', () => {

  let proxy: midware.Proxy
  let msg: any
  let msgClone: any
  let errStub: any
  const transDataKey = (message: any) => {
    message.data.key = 'hello'
  }
  const transType = (message: any) => {
    message.type = 'Event'
  }

  beforeEach(() => {
    proxy = new midware.Proxy()
    msg = {
      method: 'change',
      id: '1234567890',
      type: 'event',
      data: { key: 'value' },
      source: ':change:event/1234567890'
    }
    msgClone = clone(msg)
    const logger = Logger.get('teambition-sdk')
    errStub = sinon.stub(logger, 'error')
  })

  afterEach(() => {
    errStub.restore()
  })

  it('should return nothing and not mutate message when no interceptor is registered', () => {
    const result = proxy.apply(msg)

    expect(result).to.be.undefined
    expect(msg).to.deep.equal(msgClone)
  })

  it('should pass unaltered message to each interceptor', (done) => {
    proxy.register((message) => {
      expect(message).to.deep.equal(msgClone)
      done()
    })

    proxy.apply(msg)
  })

  it('should prevent interceptors to mutate original message', () => {
    proxy.register(transType)
    proxy.register(transDataKey)

    proxy.apply(msg)

    expect(msg).to.deep.equal(msgClone)
    expect(errStub).calledTwice
  })

  it('should be able to deregister callback', () => {
    const spy1 = sinon.spy()
    const spy2 = sinon.spy()

    const deregisterToken1 = proxy.register(spy1)
    const deregisterToken2 = proxy.register(spy2)
    deregisterToken1()
    deregisterToken2()
    proxy.apply(msg)

    expect(spy1).to.have.callCount(0)
    expect(spy2).to.have.callCount(0)
  })

  it('should be able to listen socket event', () => {
    const spy = sinon.spy()
    proxy.on(':change:event/1234567890', spy)

    proxy.apply(msg)

    expect(spy).to.have.callCount(1)
  })

  it('should be able to filter socket event [1]', () => {
    const spy = sinon.spy()
    proxy.on(':change:task/1234567890', spy)

    proxy.apply(msg)

    expect(spy).to.have.callCount(0)
  })

  it('should be able to filter socket event [2]', () => {
    const spy = sinon.spy()
    proxy.on(':change:event/\\w+', spy)

    proxy.apply(msg)

    expect(spy).to.have.callCount(0)
  })

  it('should be able to remove registed listener', () => {
    const spy = sinon.spy()
    const spy2 = sinon.spy()
    proxy.on(':change:event/1234567890', spy)
    proxy.on(':change:event/(\\d+)', spy2)

    proxy.apply(msg)

    proxy.off(':change:event/1234567890', spy)

    expect(spy).to.have.callCount(1)
    expect(spy2).to.have.callCount(1)
  })

  it('should be able to match regular expression [1]', () => {
    const spy = sinon.spy()
    proxy.on(':change:event/:id', spy)

    proxy.apply(msg)

    expect(spy).to.have.callCount(1)
  })

  it('should be able to match regular expression [2]', () => {
    const spy = sinon.spy()
    proxy.on(':change:event/(\\d+)', spy)

    proxy.apply(msg)

    expect(spy).to.have.callCount(1)
  })

  it('should be able to match regular expression [3]', () => {
    const spy = sinon.spy()
    proxy.on(':change:event/(\\d)?-996', spy)

    proxy.apply({
      method: 'change',
      id: '1-996',
      type: 'event',
      data: { key: 'value' },
      source: ':change:event/1-996'
    })

    expect(spy).to.have.callCount(1)
  })

  it('should throw if try to listen an invalid event [1]', () => {
    const fn = () => proxy.on(':change::new:event/(\\d+)', () => void 0)
    expect(fn).to.throw('Invalid socket event')
  })

  it('should throw if try to listen an invalid event [2]', () => {
    const fn = () => proxy.on('event/(\\d+)', () => void 0)
    expect(fn).to.throw('Invalid socket event')
  })

  it('should be able to \'publish\' socket event [1]', (done) => {
    proxy.publish(':change:event/(\\d+)').subscribe((data) => {
      expect(data).to.deep.equal(msg)
      done()
    })

    proxy.apply(msg)
  })

  it('should be able to \'publish\' socket event [2]', (done) => {
    proxy.publish(':change:event/(\\d+)').subscribe((data) => {
      expect(data).to.deep.equal(msg)
    })

    setTimeout(() => {
      proxy.publish(':change:event/(\\d+)').subscribe((data) => {
        expect(data).to.deep.equal(msg)
        done()
      })
    }, 1)

    proxy.apply(msg)
  })

  it('should be able to \'publish\' socket event [3]', (done) => {
    const msg2 = {
      method: 'change',
      id: '1',
      type: 'event',
      data: { key: 'value' },
      source: ':change:event/1'
    }

    setTimeout(() => {
      proxy.publish(':change:event/(\\d+)').subscribe((data) => {
        expect(data).to.deep.equal(msg2)
        done()
      })
    }, 20)

    proxy.apply(msg)
    setTimeout(() => proxy.apply(msg2), 30)
  })

  it('should be able to \'publish\' socket event [4]', (done) => {

    const buffer: any[] = []
    const subscribedBuffer: any[] = []

    proxy.publish(':change:event/(\\d+)').subscribe((data) => {
      subscribedBuffer.push(data)
      if (subscribedBuffer.length === 100) {
        expect(buffer).to.deep.equal(subscribedBuffer)
        done()
      }
    })

    for (let i = 0; i < 100; i++) {
      const newMsg = {
        method: 'change',
        id: i.toString(),
        type: 'event',
        data: { key: 'value' },
        source: `:change:event/${i}`
      }
      buffer.push(newMsg)
      proxy.apply(newMsg)
    }
  })

  it('should be able to \'publish\' socket event [5]', (done) => {
    const newMsg = {
      method: 'change',
      id: '10',
      type: 'event',
      data: { key: 'value' },
      source: `:change:event/10`
    }

    const obs1 = proxy.publish(':change:event/(\\d+)').subscribe()

    proxy.apply(newMsg)

    obs1.unsubscribe()

    proxy.publish(':change:event/(\\d+)').subscribe((data) => {
      expect(data).to.deep.equal(newMsg)
      done()
    })
  })

  it('should be able to unpublish the handler [1]', (done) => {
    const spy = sinon.spy()
    proxy.publish(':change:event/(\\d+)').subscribe(spy)
    proxy.apply(msg)

    setTimeout(() => {
      proxy.unpublish(':change:event/(\\d+)')
      proxy.apply(msg)
    }, 1)

    setTimeout(() => {
      expect(spy).to.have.callCount(1)
      done()
    }, 10)
  })

  it('should be able to unpublish the handler [2]', (done) => {
    const spy = sinon.spy()
    proxy.publish(':change:event/(\\d+)').subscribe(spy)
    proxy.apply(msg)

    setTimeout(() => {
      proxy.unpublish('unused-socket-event')
      proxy.apply(msg)
    }, 1)

    setTimeout(() => {
      expect(spy).to.have.callCount(2)
      done()
    }, 10)
  })

})

describe('WSProxy getRefreshStream() method', () => {
  const matchingMessages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].reduce((ret, x) => {
    const id = Math.random().toFixed(8)
    ret[x] = { method: 'refresh', id, type: 'tasks', data: null, source: `:refresh:tasks/${id}` }
    return ret
  }, {})

  const deamonStatusChange = { u: 'up', d: 'down' }

  let proxy: midware.Proxy
  let callbackSpy1: Subject<any>
  let callbackSpy2: Subject<any>
  let callbackSpy3: Subject<any>
  let namespacedCallbackSpies: { [key: string]: Subject<any> }
  let onStatusChange: (appNamespace: string) => (subs: Subscription | null, signal: string) => Subscription | null

  beforeEach(() => {
    proxy = new midware.Proxy()
    callbackSpy1 = new Subject()
    callbackSpy2 = new Subject()
    callbackSpy3 = new Subject()
    namespacedCallbackSpies = {
      test1: callbackSpy1,
      test2: callbackSpy2,
      test3: callbackSpy3
    }
    onStatusChange = (appNamespace: string) => (subs, signal) => {
      switch (signal) {
        case 'down':
          subs!.unsubscribe()
          return null
        case 'up':
          return proxy.getRefreshStream(appNamespace, ':refresh:tasks').subscribe((msg) => {
            namespacedCallbackSpies[appNamespace].next(msg)
          })
        default:
          return null
      }
    }
  })

  afterEach(() => {
    proxy.stopDeamon('test1/:refresh:tasks')
    proxy.stopDeamon('test2/:refresh:tasks')
    proxy.stopDeamon('test3/:refresh:tasks')
  })

  it('should trigger callback after first being activated', marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c-----d--e-', matchingMessages)
    const deamon =   m.cold('-------u-----------', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c-----d--e-', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it('should not trigger callback after suspension', marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c-----d--e-', matchingMessages)
    const deamon =   m.cold('-------u-----d-----', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c----------', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it('should not trigger callback after re-activation if there is no matching message during suspension', marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c----------', matchingMessages)
    const deamon =   m.cold('-------u-----d---u-', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c----------', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it('should trigger callback after re-activation if there is one matching message during suspension', marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c------d---', matchingMessages)
    const deamon =   m.cold('-------u-----d---u-', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c--------d-', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it('should trigger callback after re-activation with the last of the matching messages during suspension', marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c-----d-e--', matchingMessages)
    const deamon =   m.cold('-------u-----d---u-', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c--------e-', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it(`overall, should trigger callback actively when the deamon is active,
  \tand select the last matching during suspension to trigger callback on re-activation`, marbles((m) => {
    const wsMsg$ =    m.hot('^-a-b---c-----d-e--f---g-----h-', matchingMessages)
    const deamon =   m.cold('-------u-----d---u---d-----u---', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected = m.cold('--------c--------e-f-------g-h-', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected)
  }))

  it('should allow more than one differently namespaced callers to work independently', marbles((m) => {
    const wsMsg$ =     m.hot('^-a-b---c-----d-e--f---g-----h-', matchingMessages)
    const deamon1 =   m.cold('-------u-----d---u---d-----u---', deamonStatusChange).scan(onStatusChange('test1'), null)
    const expected1 = m.cold('--------c--------e-f-------g-h-', matchingMessages)
    const deamon2 =   m.cold('-u----d------u----d----------u-', deamonStatusChange).scan(onStatusChange('test2'), null)
    const expected2 = m.cold('--a-b--------cd-e------------(gh)-', matchingMessages)
    const deamon3 =   m.cold('----------u------d----------u--', deamonStatusChange).scan(onStatusChange('test3'), null)
    const expected3 = m.cold('--------------d-e-----------gh-', matchingMessages)

    wsMsg$.subscribe(proxy.apply)
    deamon1.subscribe()
    deamon2.subscribe()
    deamon3.subscribe()

    m.expect(callbackSpy1).toBeObservable(expected1)
    m.expect(callbackSpy2).toBeObservable(expected2)
    m.expect(callbackSpy3).toBeObservable(expected3)
  }))
})
