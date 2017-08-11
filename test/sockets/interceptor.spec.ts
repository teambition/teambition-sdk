import { describe, it, beforeEach, afterEach } from 'tman'
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

  it('shortCircuit and ignoreDefaultDBOps', () => {
    const interceptor: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return CF.IgnoreDefaultDBOps
    })

    const result = interceptor(msg)

    expect(result).to.equal(CF.IgnoreDefaultDBOps)
    expect(msg).to.deep.equal(msgClone)
    expect(errStub).to.called
  })

  it('mutateMessage + IgnoreDefaultDBOps', () => {
    const intercept: any = midware.createInterceptor((message) => {
      simpleTransFn(message)
      return CF.IgnoreDefaultDBOps
    }, {
      mutate: true
    })

    const result = intercept(msg)

    expect(result).to.equal(CF.IgnoreDefaultDBOps)
    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
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

  it('should shortcircuit when an interceptor returns IgnoreDefaultDBOps flag', () => {
    interceptors.append((message: any) => {
      transDataKey(message)
      return CF.IgnoreDefaultDBOps
    }, { mutate: true })
    interceptors.append(transType, { mutate: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.IgnoreDefaultDBOps)
    expect(msg.data.key).to.equal('hello')
    expect(msg.type).to.equal('event')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

})

describe('Socket interceptor as Proxy', () => {

  let interceptors: midware.WSProxy
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
    interceptors = new midware.WSProxy()
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

  it('should return nothing and not mutate message when no interceptor is registered', () => {
    const result = interceptors.apply(msg)

    expect(result).to.be.undefined
    expect(msg).to.deep.equal(msgClone)
  })

  it('should pass unaltered message to each interceptor', () => {
    interceptors.register((message) => {
      expect(message).to.deep.equal(msgClone)
    })

    interceptors.apply(msg)
  })

  it('should prevent interceptors to mutate original message', () => {
    interceptors.register(transType)
    interceptors.register(transDataKey)

    interceptors.apply(msg)

    expect(msg).to.deep.equal(msgClone)
    expect(errStub).calledTwice
  })

  it('should be able to deregister callback', () => {
    const spy1 = sinon.spy()
    const spy2 = sinon.spy()

    const deregisterToken1 = interceptors.register(spy1)
    const deregisterToken2 = interceptors.register(spy2)
    deregisterToken1()
    deregisterToken2()
    interceptors.apply(msg)

    expect(spy1).to.have.callCount(0)
    expect(spy2).to.have.callCount(0)
  })

})
