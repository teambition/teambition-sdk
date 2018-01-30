import { describe, it, beforeEach, afterEach } from 'tman'
import { Observable } from 'rxjs/Observable'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { clone } from '../utils'
import { WSMiddleware as midware } from '../'
import { Logger } from 'reactivedb'

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

describe('Socket interceptor as ProxyToDB', () => {

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

describe('Socket interceptor as Proxy', () => {

  let proxy: midware.WSProxy
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
    proxy = new midware.WSProxy()
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
