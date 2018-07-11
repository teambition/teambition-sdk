import { SocketClient, Backend, apihost, SocketMock, BaseFetch } from '../index'
import { flush } from '../utils'
import { userMe } from '../../mock/userme'
import * as sinon from 'sinon'
import { expect } from 'chai'

export default describe('SocketClient', () => {
  let httpBackend: Backend
  let spy: sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    new SocketMock(SocketClient, BaseFetch)
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}users/me`)
      .respond(JSON.stringify(userMe))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  it('should connect to target URL', () => {
    const socketUrl = 'ws://localhost:1111'

    httpBackend.whenGET(`${socketUrl}/websocket?token=${userMe.tcmToken}`)
      .respond(JSON.stringify({}))

    SocketClient.setSocketUrl(socketUrl)
    SocketClient.connect()

    expect(spy).to.be.calledTwice
  })

  it('should allow SocketURL including path', () => {
    const socketUrl = 'ws://localhost:1111/messaging'

    httpBackend.whenGET(`${socketUrl}/websocket?token=${userMe.tcmToken}`)
      .respond(JSON.stringify({}))

    SocketClient.setSocketUrl(socketUrl)
    SocketClient.connect()

    expect(spy).to.be.calledTwice
  })
})
