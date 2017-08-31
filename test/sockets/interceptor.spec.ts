import { describe, it, beforeEach } from 'tman'
import { expect } from 'chai'
import { clone } from '../utils'
import {
  Sequence,
  createInterceptor,
  ControlFlow as CF,
  ControlFlowGiveUp as CFGiveUp
} from '../../src/sockets/SocketInterceptor'

describe('Socket interceptor creator', () => {

  let msg: any
  let msgClone: any
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
  })

  it('different control flows results should be different', () => {
    const controlFlows = [
      CF.ShortCircuit,
      CF.IgnoreDefaultDBOps,
      CF.PassThrough,
      CF.ShortCircuitAndIgnoreDefaultDBOps
    ]
    const controlFlowSet = new Set(controlFlows)

    expect(controlFlowSet.size).to.equal(controlFlows.length)
  })

  it('no flag', () => {
    const interceptor000 = createInterceptor(simpleTransFn)

    const result = interceptor000(msg)

    expect(result).to.equal(CF.PassThrough)
    expect(msg).to.deep.equal(msgClone)
  })

  it('shortCircuit', () => {
    const interceptor001 = createInterceptor(simpleTransFn, {
      shortCircuit: true
    })

    const result = interceptor001(msg)

    expect(result).to.equal(CF.ShortCircuit)
    expect(msg).to.deep.equal(msgClone)
  })

  it('mutateMessage', () => {
    const interceptor010 = createInterceptor(simpleTransFn, { mutateMessage: true })

    const result = interceptor010(msg)

    expect(result).to.equal(CF.PassThrough)
    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('shortCircuit + mutateMessage', () => {
    const interceptor011 = createInterceptor(simpleTransFn, {
      shortCircuit: true, mutateMessage: true
    })

    const result = interceptor011(msg)

    expect(result).to.equal(CF.ShortCircuit)
    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('shortCircuit and ignoreDefaultDBOps', () => {
    const interceptor100 = createInterceptor(simpleTransFn, {
      shortCircuitAndIgnoreDefaultDBOps: true
    })

    const result = interceptor100(msg)

    expect(result).to.equal(CF.ShortCircuitAndIgnoreDefaultDBOps)
    expect(msg).to.deep.equal(msgClone)
  })

  it('mutateMessage + shortCircuitAndIgnoreDefaultDBOps', () => {
    const intercept111 = createInterceptor(simpleTransFn, {
      mutateMessage: true, shortCircuitAndIgnoreDefaultDBOps: true
    })

    const result = intercept111(msg)

    expect(result).to.equal(CF.ShortCircuitAndIgnoreDefaultDBOps)
    expect(msg.data.key).to.equal('hello')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('allow userFn to give up control flow flag: shortCircuit', () => {
    const intercept = createInterceptor((message) => {
      simpleTransFn(message)
      return CFGiveUp.GiveUpShortCircuit
    }, { shortCircuitAndIgnoreDefaultDBOps: true })

    const result = intercept(msg)

    expect(result).to.equal(CF.IgnoreDefaultDBOps)
    expect(msg).to.deep.equal(msgClone)
  })

  it('allow userFn to give up control flow flag: ignoreDefaultDBOps', () => {
    const intercept = createInterceptor((message) => {
      simpleTransFn(message)
      return CFGiveUp.GiveUpIgnoreDefaultDBOps
    }, { shortCircuitAndIgnoreDefaultDBOps: true })

    const result = intercept(msg)

    expect(result).to.equal(CF.ShortCircuit)
    expect(msg).to.deep.equal(msgClone)
  })

  it('allow userFn to give up control flow flags: shortCircuit and ignoreDefaultDBOps', () => {
    const intercept = createInterceptor((message) => {
      simpleTransFn(message)
      return CFGiveUp.GiveUpShortCircuitAndIgnoreDefaultDBOps
    }, { shortCircuitAndIgnoreDefaultDBOps: true })

    const result = intercept(msg)

    expect(result).to.equal(CF.PassThrough)
    expect(msg).to.deep.equal(msgClone)
  })

  it('should ignore a return value (by userFunc) that is not one of the ControlFlowGiveUp flags', () => {
    const intercept = createInterceptor((message) => {
      simpleTransFn(message)
      return CF.ShortCircuit as any
    })

    const result = intercept(msg)

    expect(result).to.equal(CF.PassThrough)
    expect(msg).to.deep.equal(msgClone)
  })
})

describe('Socket interceptor sequencing', () => {

  let interceptors: Sequence
  let msg: any
  let msgClone: any
  const transDataKey = (message: any) => {
    message.data.key = 'hello'
  }
  const transType = (message: any) => {
    message.type = 'Event'
  }

  beforeEach(() => {
    interceptors = new Sequence()
    msg = {
      method: 'change',
      id: '1234567890',
      type: 'event',
      data: { key: 'value' }
    }
    msgClone = clone(msg)
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
  })

  it('should passthrough when all interceptors are passthroughs: with message mutation', () => {
    interceptors.append(transDataKey, { mutateMessage: true })
    interceptors.append(transType, { mutateMessage: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.PassThrough)
    expect(msg.type).to.equal('Event')
    expect(msg.data.key).to.equal('hello')

    msg.type = 'event'
    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })


  it('should shortcircuit when an interceptor returns ShortCircuit flag', () => {
    interceptors.append(transDataKey, {
      mutateMessage: true,
      shortCircuit: true
    })
    interceptors.append(transType, { mutateMessage: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.ShortCircuit)
    expect(msg.data.key).to.equal('hello')
    expect(msg.type).to.equal('event')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

  it('should shortcircuit when an interceptor returns ShortCircuitAndIgnoreDefaultDBOps flag', () => {
    interceptors.append(transDataKey, {
      mutateMessage: true,
      shortCircuitAndIgnoreDefaultDBOps: true
    })
    interceptors.append(transType, { mutateMessage: true })

    const controlFlow = interceptors.apply(msg)

    expect(controlFlow).to.equal(CF.ShortCircuitAndIgnoreDefaultDBOps)
    expect(msg.data.key).to.equal('hello')
    expect(msg.type).to.equal('event')

    msg.data.key = 'value'
    expect(msg).to.deep.equal(msgClone)
  })

})
