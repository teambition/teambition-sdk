'use strict'
import * as chai from 'chai'
import { apihost, PreferenceAPI, SocketMock, SocketClient, Backend, clone, BaseFetch } from '../index'
import { flush } from '../utils'
import { preference } from '../../mock/preference'

const expect = chai.expect

export default describe('socket preference test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let PreferenceApi: PreferenceAPI
  const mockPreference = clone(preference)

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient, BaseFetch)
    PreferenceApi = new PreferenceAPI()

    httpBackend.whenGET(`${apihost}preferences`)
      .respond(JSON.stringify(mockPreference))
  })

  it('change preference should ok', function* () {

    const signal = PreferenceApi.getPreference()
      .publish()
      .refCount()

    yield Socket.emit('change', 'preference', mockPreference._id, {
      openWindowMode: 'slide'
    }, signal.take(1))

    yield signal.take(1)
      .do(data => {
        expect(data.openWindowMode).to.equal('slide')
      })
  })
})
