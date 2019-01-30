import { describe, it, beforeEach, afterEach } from 'tman'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as moment from 'moment'
import * as URL from 'url'

import { createSdkWithoutRDB, context, SDK, UserMe } from '..'

const mockRequire = require('mock-require')

// atob polyfill
// 这个方法在 浏览器 环境才存在
const atob = require('atob')
context.atob = context.atob || atob

describe('SocketClient', () => {
  const userMe = { tcmToken: 'mock-tcm-token' } as UserMe

  let sdk: SDK
  let sandbox: sinon.SinonSandbox
  let fetchSpy: sinon.SinonSpy

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    // https://github.com/socketio/engine.io-client/blob/master/lib/transports/polling-xhr.js#L7
    mockRequire(
      'xmlhttprequest-ssl',
      class XMLHttpRequest {
        open = (fetchSpy = sandbox.spy())
        send = sandbox.spy()
      }
    )

    sdk = createSdkWithoutRDB()
    const Consumer = require('snapper-consumer')
    sdk.socketClient.initClient(new Consumer(), userMe)

    // 用于解析 tcmToken 过期时间
    sandbox.stub(context, 'atob').value(() => {
      return JSON.stringify({
        // 返回一个较晚的过期时间（一年后）
        exp: moment()
          .add(1, 'y')
          .valueOf()
      })
    })
  })

  afterEach(() => {
    sandbox.restore()
    mockRequire.stopAll()
  })

  it('should connect to target URL (HTTP)', async () => {
    const socketUrl = 'http://localhost:1111'
    const url = `${socketUrl}/websocket/?token=${userMe.tcmToken}`

    sdk.socketClient.setSocketUrl(socketUrl)
    await sdk.socketClient.connect()

    expect(fetchSpy.calledWith('GET', sinon.match(url))).to.be.true
  })

  it('should connect to target URL (WS)', async () => {
    const socketUrl = 'ws://localhost:1111'
    const url = `${socketUrl}/websocket/?token=${userMe.tcmToken}`

    sdk.socketClient.setSocketUrl(socketUrl)
    await sdk.socketClient.connect()

    expect(
      fetchSpy.calledWith(
        'GET',
        sinon.match((pollingUri: string) => matchPollingUri(pollingUri, url))
      )
    ).to.be.true
  })

  it('should allow SocketURL (HTTP) including url', async () => {
    const socketUrl = 'http://localhost:1111/messaging'
    const url = `${socketUrl}/websocket/?token=${userMe.tcmToken}`

    sdk.socketClient.setSocketUrl(socketUrl)
    await sdk.socketClient.connect()

    expect(fetchSpy.calledWith('GET', sinon.match(url))).to.be.true
  })

  it('should allow SocketURL (WS) including url', async () => {
    const socketUrl = 'ws://localhost:1111/messaging'
    const url = `${socketUrl}/websocket/?token=${userMe.tcmToken}`

    sdk.socketClient.setSocketUrl(socketUrl)
    await sdk.socketClient.connect()

    expect(
      fetchSpy.calledWith(
        'GET',
        sinon.match((pollingUri: string) => matchPollingUri(pollingUri, url))
      )
    ).to.be.true
  })

  it('should not append `/websocket` postfix if the SocketURL already has it', async () => {
    const socketUrl = 'ws://localhost:1111/messaging/websocket'
    const url = `ws://localhost:1111/messaging/websocket/?token=${userMe.tcmToken}`

    sdk.socketClient.setSocketUrl(socketUrl)
    await sdk.socketClient.connect()

    expect(
      fetchSpy.calledWith(
        'GET',
        sinon.match((pollingUri: string) => matchPollingUri(pollingUri, url))
      )
    ).to.be.true
  })
})

const matchPollingUri = (actual: string, expected: string) => {
  const actualUri = toPollingUri(actual)
  const expectedUri = toPollingUri(expected)

  return actualUri.includes(expectedUri)
}

// 在 Engine.IO 里会把 ws/wss 转为 http/https
// https://github.com/socketio/engine.io-client/blob/master/lib/transports/polling.js#L218
const toPollingUri = (url: string) => {
  const urlObj = URL.parse(url)
  const schema =
    (urlObj.protocol && PollingUriSchemaMap[urlObj.protocol]) || urlObj.protocol

  return URL.format({
    ...urlObj,
    protocol: schema
  })
}

const PollingUriSchemaMap: Record<string, string> = {
  'ws:': 'http:',
  'wss:': 'https:'
}
