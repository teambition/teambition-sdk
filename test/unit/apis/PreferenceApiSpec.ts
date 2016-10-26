'use strict'
import * as chai from 'chai'
import { Backend, PreferenceAPI, forEach, clone, apihost } from '../index'
import { preference } from '../../mock/preference'
import { flush } from '../utils'

const expect = chai.expect

export default describe('Preferences API test', () => {

  let httpBackend: Backend
  let PreferenceApi: PreferenceAPI

  const preferenceId = preference._id

  beforeEach(() => {
    flush()
    PreferenceApi = new PreferenceAPI()
    httpBackend = new Backend()

    httpBackend
      .whenGET(`${apihost}preferences`)
      .respond(JSON.stringify(preference))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get preferences should ok', done => {
    PreferenceApi.getPreference()
      .subscribe(data => {
        forEach(preference, (value: any, key: string) => {
          expect(preference[key]).deep.equal(data[key])
        })
        done()
      })
  })

  it('update preferences should ok', function* () {
    const mockPut = clone(preference)
    mockPut.language = 'zh'

    httpBackend
      .whenPUT(`${apihost}preferences/${preferenceId}`, {
        language: 'zh'
      })
      .respond(JSON.stringify(mockPut))

    const signal = PreferenceApi.getPreference()
      .publish()
      .refCount()

    yield signal.take(1)

    yield PreferenceApi.update(<any>preferenceId, {
      language: 'zh'
    })
      .do(r => {
        expect(r).to.deep.equal(mockPut)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.language).to.equal('zh')
      })
  })
})
