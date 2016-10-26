'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import {
  CollectionAPI,
  Backend,
  apihost,
  BaseFetch,
  forEach,
  clone,
  TBCollectionSchema
} from '../index'
import { collections } from '../../mock/collections'
import { flush, expectDeepEqual, notInclude } from '../utils'

const expect = chai.expect

export default describe('Collection API test', () => {
  let httpBackend: Backend
  let collectionAPI: CollectionAPI
  let spy: Sinon.SinonSpy

  const parentId = collections[0]._parentId

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    collectionAPI = new CollectionAPI()

    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenGET(`${apihost}collections?_parentId=${parentId}`)
      .respond(JSON.stringify(collections))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get collections should ok', done => {
    collectionAPI.getByParent(parentId)
      .subscribe(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(val, collections[index])
        })
        done()
      })
  })

  it('get collections from cache should ok', function* () {
    yield collectionAPI.getByParent(parentId)
      .take(1)

    yield collectionAPI.getByParent(parentId)
      .take(1)
      .do(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(val, collections[index])
        })
        expect(spy).to.be.calledOnce
      })
  })

  it('create collection should ok', function* () {
    const mockCollection = clone(collections[0])
    mockCollection._id = <any>'testcollection'
    mockCollection._parentId = parentId

    httpBackend.whenPOST(`${apihost}collections`, {
      title: 'test',
      _parentId: parentId
    })
      .respond(JSON.stringify(mockCollection))

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield collectionAPI.create({
      title: 'test',
      _parentId: parentId
    })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length + 1)
        expectDeepEqual(r[0], mockCollection)
      })
  })

  it('get collection should ok', done => {
    const mockCollection = clone(collections[0])
    const collectionId = mockCollection._id

    httpBackend.whenGET(`${apihost}collections/${collectionId}`)
      .respond(JSON.stringify(mockCollection))

    collectionAPI.get(collectionId)
      .subscribe(r => {
        expectDeepEqual(r, collections[0])
        done()
      })
  })

  it('get collection from cache should ok', function* () {
    const mockCollection = clone(collections[0])
    const collectionId = mockCollection._id

    httpBackend.whenGET(`${apihost}collections/${collectionId}`)
      .respond(JSON.stringify(mockCollection))

    yield collectionAPI.getByParent(parentId)
      .take(1)

    yield collectionAPI.get(collectionId)
      .take(1)
      .do(r => {
        expectDeepEqual(r, collections[0])
        expect(spy).to.be.calledOnce
      })
  })

  it('update collection should ok', function* () {
    const mockCollection = clone(collections[0])
    const collectionId = mockCollection._id
    mockCollection.title = 'test'

    httpBackend.whenPUT(`${apihost}collections/${collectionId}`, {
      title: 'test'
    })
      .respond(JSON.stringify(mockCollection))

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield collectionAPI.update(collectionId, {
      title: 'test'
    })

    yield signal.take(1)
      .do(r => {
        expect(r[0].title).to.equal('test')
      })

  })

  it('delete collection should ok', function* () {
    const collectionId = collections[0]._id

    httpBackend.whenDELETE(`${apihost}collections/${collectionId}`)
      .respond({})

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield collectionAPI.delete(collectionId)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
      })
  })

  it('archive collection should ok', function* () {
    const collectionId = collections[0]._id
    const mockResponse = {
      _id: collectionId,
      isArchived: true,
      updated: new Date().toISOString()
    }

    httpBackend.whenPOST(`${apihost}collections/${collectionId}/archive`)
      .respond(JSON.stringify(mockResponse))

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield collectionAPI.archive(collectionId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
      })

  })

  it('move collection should ok', function* () {
    const mockcollections: TBCollectionSchema[] = JSON.parse(JSON.stringify(collections))
    const mockResponse = {
      _id: collections[0]._id,
      _parentId: 'mockparentid'
    }

    forEach(mockcollections, (collection, index) => {
      collection._id = <any>(<any>collection._id + index)
      collection._parentId = <any>'mockparentid'
    })

    httpBackend.whenGET(`${apihost}collections?_parentId=mockparentid`)
      .respond(JSON.stringify(mockcollections))

    httpBackend.whenPUT(`${apihost}collections/${collections[0]._id}/move`, {
      _parentId: 'mockparentid'
    })
      .respond(JSON.stringify(mockResponse))

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    const signal2 = collectionAPI.getByParent(<any>'mockparentid')
      .publish()
      .refCount()

    yield signal2.take(1)

    yield collectionAPI.move(collections[0]._id, <any>'mockparentid')
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
      })

    yield signal2.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length + 1)
        forEach(r[0], (val: any, key: string) => {
          if (key !== '_id' && key !== '_requested') {
            expect(val).to.deep.equal(r[1][key])
          }
        })
      })
  })

  it('unarchive test should ok', function* () {
    const mockCollection = clone(collections[0])
    mockCollection._id = <any>'mockcollectionid'
    mockCollection.isArchived = true
    const mockResponse = {
      _id: 'mockcollectionid',
      isArchived: false,
      updated: new Date().toISOString()
    }

    httpBackend.whenGET(`${apihost}collections/mockcollectionid`)
      .respond(JSON.stringify(mockCollection))

    httpBackend.whenDELETE(`${apihost}collections/mockcollectionid/archive`)
      .respond(JSON.stringify(mockResponse))

    const signal = collectionAPI.getByParent(parentId)
      .publish()
      .refCount()

    yield signal.take(1)

    const signal2 = collectionAPI.get(<any>'mockcollectionid')
      .publish()
      .refCount()

    yield signal2.take(1)

    yield collectionAPI.unarchive(<any>'mockcollectionid')
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(collections.length + 1)
        expect(r[0]._id).to.equal('mockcollectionid')
      })

    yield signal2.take(1)
      .subscribe(r => {
        expect(r.isArchived).to.be.false
      })
  })
})
