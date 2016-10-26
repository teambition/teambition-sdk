'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Backend, LikeAPI, apihost, BaseFetch, clone } from '../index'
import { like } from '../../mock/like'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('LikeAPI test: ', () => {
  let httpBackend: Backend
  let LikeApi: LikeAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    LikeApi = new LikeAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}tasks/mocktask/like?all=1`)
      .respond(JSON.stringify(like))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get like should ok', done => {
    LikeApi.getLike('task', <any>'mocktask')
      .subscribe(r => {
        expectDeepEqual(like, r)
        done()
      })
  })

  it('get like from cache should ok', function* () {
    const signal = LikeApi.getLike('task', <any>'mocktask')

    yield signal.take(1)

    yield signal.take(1)
      .do(r => {
        expectDeepEqual(like, r)
        expect(spy).to.be.calledOnce
      })
  })

  it('like should ok', function* () {
    const signal = LikeApi.getLike('task', <any>'mocktask')

    httpBackend.whenPOST(`${apihost}tasks/mocktask/like`)
      .respond({
        likesCount: like.likesCount + 1,
        isLike: true,
        likesGroup: like.likesGroup.concat({
          _id: 'mockmember',
          name: 'mockmember',
          avatarUrl: 'url'
        })
      })

    yield signal.take(1)

    yield LikeApi.like('task', <any>'mocktask')

    yield signal.take(1)
      .do(r => {
        expect(r.likesGroup).to.deep.equal(like.likesGroup.concat({
          _id: 'mockmember',
          name: 'mockmember',
          avatarUrl: 'url'
        }))
      })
  })

  it('unlike should ok', function* () {
    const signal = LikeApi.getLike('task', <any>'mocktask')

    httpBackend.whenDELETE(`${apihost}tasks/mocktask/like`)
      .respond({
        isLike: false,
        likesGroup: clone(like).likesGroup.slice(1)
      })

    yield signal.take(1)

    yield LikeApi.unlike('task', <any>'mocktask')

    yield signal.take(1)
      ._do(r => {
        expect(r.likesGroup.length).to.equal(like.likesGroup.length - 1)
      })
  })
})
