'use strict'
import { Scheduler } from 'rxjs'
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

    httpBackend.flush()
  })

  it('get collections from cache should ok', done => {
    collectionAPI.getByParent(parentId)
      .subscribe()

    collectionAPI.getByParent(parentId)
      .subscribeOn(Scheduler.async, global.timeout2)
      .subscribe(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(val, collections[index])
        })
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('create collection should ok', done => {
    const mockCollection = clone(collections[0])
    mockCollection._id = 'testcollection'
    mockCollection._parentId = parentId

    httpBackend.whenPOST(`${apihost}collections`, {
      title: 'test',
      _parentId: parentId
    })
      .respond(JSON.stringify(mockCollection))

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length + 1)
        expectDeepEqual(r[0], mockCollection)
        done()
      })

    collectionAPI.create({
      title: 'test',
      _parentId: parentId
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
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

    httpBackend.flush()
  })

  it('get collection from cache should ok', done => {
    const mockCollection = clone(collections[0])
    const collectionId = mockCollection._id

    httpBackend.whenGET(`${apihost}collections/${collectionId}`)
      .respond(JSON.stringify(mockCollection))

    collectionAPI.getByParent(parentId)
      .subscribe()

    collectionAPI.get(collectionId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expectDeepEqual(r, collections[0])
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('update collection should ok', done => {
    const mockCollection = clone(collections[0])
    const collectionId = mockCollection._id
    mockCollection.title = 'test'

    httpBackend.whenPUT(`${apihost}collections/${collectionId}`, {
      title: 'test'
    })
      .respond(JSON.stringify(mockCollection))

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r[0].title).to.equal('test')
        done()
      })

    collectionAPI.update(collectionId, {
      title: 'test'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()

  })

  it('delete collection should ok', done => {
    const collectionId = collections[0]._id

    httpBackend.whenDELETE(`${apihost}collections/${collectionId}`)
      .respond({})

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
        done()
      })

    collectionAPI.delete(collectionId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('archive collection should ok', done => {
    const collectionId = collections[0]._id

    httpBackend.whenPOST(`${apihost}collections/${collectionId}/archive`)
      .respond({
        _id: collectionId,
        isArchived: true,
        updated: new Date().toISOString()
      })

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
        done()
      })

    collectionAPI.archive(collectionId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('move collection should ok', done => {
    const mockcollections: TBCollectionSchema[] = JSON.parse(JSON.stringify(collections))

    forEach(mockcollections, (collection, index) => {
      collection._id = collection._id + index
      collection._parentId = 'mockparentid'
    })

    httpBackend.whenGET(`${apihost}collections?_parentId=mockparentid`)
      .respond(JSON.stringify(mockcollections))

    httpBackend.whenPUT(`${apihost}collections/${collections[0]._id}/move`, {
      _parentId: 'mockparentid'
    })
      .respond({
        _id: collections[0]._id,
        _parentId: 'mockparentid'
      })

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length - 1)
        expect(notInclude(r, collections[0])).to.be.true
      })

    collectionAPI.getByParent('mockparentid')
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length + 1)
        forEach(r[0], (val: any, key: string) => {
          if (key !== '_id') {
            expect(val).to.deep.equal(r[1][key])
          }
        })
        done()
      })

    collectionAPI.move(collections[0]._id, 'mockparentid')
      .subscribeOn(Scheduler.async, global.timeout3)
      .subscribe()

    httpBackend.flush()
  })

  it('unarchive test should ok', done => {
    const mockCollection = clone(collections[0])
    mockCollection._id = 'mockcollectionid'
    mockCollection.isArchived = true

    httpBackend.whenGET(`${apihost}collections/mockcollectionid`)
      .respond(JSON.stringify(mockCollection))

    httpBackend.whenDELETE(`${apihost}collections/mockcollectionid/archive`)
      .respond({
        _id: 'mockcollectionid',
        isArchived: false,
        updated: new Date().toISOString()
      })

    collectionAPI.getByParent(parentId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(collections.length + 1)
        expect(r[0]._id).to.equal('mockcollectionid')
      })

    collectionAPI.get('mockcollectionid')
      .skip(1)
      .subscribe(r => {
        expect(r.isArchived).to.be.false
        done()
      })

    collectionAPI.unarchive('mockcollectionid')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })
})
