'use strict'
import * as chai from 'chai'
import { apihost, PreferenceAPI, SocketMock, Backend, clone } from '../index'
import { flush } from '../utils'
import { preference} from '../../mock/preference'

const expect = chai.expect

export default describe('socket preference test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let PreferenceApi: PreferenceAPI
  const mockPreference = clone(preference)

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    PreferenceApi = new PreferenceAPI()

    httpBackend.whenGET(`${apihost}preferences`)
      .respond(JSON.stringify(mockPreference))
  })

  it('change preference should ok', done => {

    PreferenceApi.getPreference()
      .skip(1)
      .subscribe(data => {
        expect(data.openWindowMode).to.equal('slide')
        done()
      })

    Socket.emit('change', 'preference', mockPreference._id, {
      openWindowMode: 'slide'
    })

    httpBackend.flush()
  })
})
