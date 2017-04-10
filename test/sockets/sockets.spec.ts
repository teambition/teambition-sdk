import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock } from '../index'
import { restore } from '../utils'
import * as sinon from 'sinon'
import { Logger } from 'reactivedb'

describe('Socket handling Spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should warn but not throw when the target table is non-existent', function* () {
    const logger = Logger.get('teambition-sdk')
    const spy = sinon.spy(logger, 'warn')
    const tx: any = 'Non-existent-table'
    yield socket.emit('new', tx, '', {})
    expect(spy).to.be.calledWith(`Non-existent table: ${tx}`)
    spy.restore()
  })
})
