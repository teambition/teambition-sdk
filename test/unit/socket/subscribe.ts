'use strict'
import { apihost, Backend, SocketMock, SubscribeAPI, clone } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { orgsSubscribe } from '../../mock/orgsSubscribe'

export default describe('Organization Subscribe Socket:', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let SubscribeApi: SubscribeAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    SubscribeApi = new SubscribeAPI()

    httpBackend.whenGET(`${apihost}subscribers/report?_organizationId=mock`)
      .respond(JSON.stringify(orgsSubscribe))
  })

  it('udpate subscribe should ok', done => {
    const mockUpdate = clone(orgsSubscribe)
    mockUpdate.body.projects = mockUpdate.body.projects.concat([
      {
        _id: 'mockprojectid',
        name: 'mockprojectId',
        logo: 'logo',
        py: 'mockproject',
        pinyin: 'mockproject'
      }
    ])

    SubscribeApi.getOrgsSubscribe('mock')
      .skip(1)
      .subscribe(r => {
        expectDeepEqual(r, mockUpdate)
        done()
      })

    Socket.emit('change', 'subscriber', orgsSubscribe._id, mockUpdate)

    httpBackend.flush()
  })
})
