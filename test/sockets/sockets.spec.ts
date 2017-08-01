import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, SDKFetch } from '../'
import { restore } from '../utils'
import * as sinon from 'sinon'
import { Logger } from 'reactivedb'

const fetchMock = require('fetch-mock')

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

describe('join/leave `room`', () => {

  const sampleRoom = 'projects'
  const sampleConsumerId = '123helloworld456'

  let sdkFetch: SDKFetch

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('joinRoom should POST consumerId to :room/subscribe', async () => {
    const expectedUrl = `/${sampleRoom}/subscribe`

    fetchMock.postOnce(expectedUrl, { status: 200 })

    await sdkFetch.joinRoom(sampleRoom, sampleConsumerId)

    expect(fetchMock.lastUrl()).to.equal(expectedUrl)
    expect(fetchMock.lastOptions().body).to.equal(`{"consumerId":"${sampleConsumerId}"}`)
  })

  it('leaveRoom should DELETE consumerId from :room/subscribe', async () => {
    const expectedUrl = `/${sampleRoom}/subscribe`

    fetchMock.deleteOnce(expectedUrl, { status: 200 })

    await sdkFetch.leaveRoom(sampleRoom, sampleConsumerId)

    expect(fetchMock.lastUrl()).to.equal(expectedUrl)
    expect(fetchMock.lastOptions().body).to.equal(`{"consumerId":"${sampleConsumerId}"}`)
  })
})
