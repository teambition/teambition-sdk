'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import {
  FileAPI,
  FileSchema,
  apihost,
  Backend,
  BaseFetch,
  uuid,
  Utils
} from '../index'
import { flush, expectDeepEqual } from '../utils'
import { mockPureFile, mockFile } from '../../mock/files'

const expect = chai.expect

export default describe('FileAPI test: ', () => {

  let httpBackend: Backend
  let File: FileAPI
  let spy: Sinon.SinonSpy

  const pureFile = Utils.clone(mockPureFile)
  const projectId = <any>uuid()
  const parentId = <any>uuid()
  const count = 30
  const total = 80
  const toIds = (...data) => [].concat(...data.map(array => array.map(one => one._id)))

  let file: FileSchema
  let files: FileSchema[]
  let filesInPageOne: FileSchema[]
  let filesInPageTwo: FileSchema[]

  const initialize = () => {
    file = <any> Utils.assign(Utils.clone(mockFile), {
      _id: uuid(),
      _projectId: projectId,
      _parentId: parentId
    })
    files = Array(total).fill(null).map(() => {
      const misaki = Utils.clone(file)
      misaki._id = <any>uuid()
      return misaki
    })
    filesInPageOne = Utils.clone(files.slice(0, count))
    filesInPageTwo = Utils.clone(files.slice(count, count * 2))
  }

  beforeEach(() => {
    flush()
    initialize()

    httpBackend = new Backend()
    File = new FileAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')

    httpBackend.whenPOST(`https://striker.teambition.net/upload`, {})
      .respond(pureFile)

    httpBackend.whenGET(`${apihost}works/${file._id}`)
      .respond(JSON.stringify(file))

    httpBackend.whenGET(`${apihost}projects/${projectId}/collections/${parentId}/works`)
      .respond(JSON.stringify(files))

    httpBackend.whenGET(`${apihost}projects/${projectId}/collections/${parentId}/works?page=1`)
      .respond(JSON.stringify(filesInPageOne))

    httpBackend.whenGET(`${apihost}projects/${projectId}/collections/${parentId}/works?page=2`)
      .respond(JSON.stringify(filesInPageTwo))

    httpBackend.whenGET(`${apihost}users/me`)
      .respond({
        strikerAuth: 'Striker Auth Mock'
      })
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('should get one file', function* () {
    const fileId = file._id

    const signal = File.get(fileId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(data => {
        expectDeepEqual(data, file)
        expect(spy.callCount).to.be.equal(1)
      })

    // cache
    yield signal.take(1)
      .do(data => {
        expectDeepEqual(data, file)
        expect(spy.callCount).to.be.equal(1)
      })
  })

  it('should get files in collection', function* () {
    const signalOne = File.getFiles(projectId, parentId, {page: 1})
      .publish()
      .refCount()

    const signalTwo = File.getFiles(projectId, parentId, {page: 2})
      .publish()
      .refCount()

    yield signalOne.take(1)
      .do(data => {
        expect(toIds(data))
          .to.be.deep
          .equal(toIds(filesInPageOne))
        expect(spy.callCount).to.be.equal(1)
      })

    yield signalTwo.take(1)
      .do(data => {
        expect(toIds(data))
          .to.be.deep
          .equal(toIds(filesInPageTwo))
        expect(spy.callCount).to.be.equal(2)
      })

    // cache
    yield signalOne.take(1)
      .do(data => {
        expect(toIds(data))
          .to.be.deep
          .equal(toIds(filesInPageOne, filesInPageTwo))
        expect(spy.callCount).to.be.equal(2)
      })

    // cache
    yield signalTwo.take(1)
      .do(data => {
        expect(toIds(data))
          .to.be.deep
          .equal(toIds(filesInPageTwo))
        expect(spy.callCount).to.be.equal(2)
      })
  })

  it('should create new file then added to collection', function* () {
    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    httpBackend.whenPOST(`${apihost}works`, {
        _parentId: parentId,
        works: [pureFile]
      })
      .respond(JSON.stringify([file]))

    yield signal.take(1)

    // new one
    yield File.create(<any>{}, parentId)
      .do(data => {
        expectDeepEqual(data, file)
      })

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length + 1)
        expectDeepEqual(data[0], file)
      })
  })

  it('should delete one then removed from collection', function* () {
    const file = files[0]
    const fileId = file._id
    const nextOne = files[1]

    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    httpBackend.whenDELETE(`${apihost}works/${fileId}`)
      .respond(JSON.stringify({}))

    yield signal.take(1)

    yield File.delete(fileId)

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length - 1)
        expectDeepEqual(data[0], nextOne)
      })
  })

  it('should update filename and description', function* () {
    const fileId = file._id
    const patch = {
      fileName: uuid(),
      description: uuid()
    }
    const response = Utils.assign(Utils.clone(patch), {
      _id: fileId,
      updated: new Date().toISOString()
    })

    const signal = File.get(fileId)
      .publish()
      .refCount()

    httpBackend.whenPUT(`${apihost}works/${fileId}`, patch)
      .respond(JSON.stringify(response))

    yield signal.take(1)

    yield File.update(fileId, patch)

    // get one
    yield signal.take(1)
      .do(data => {
        expect(data.fileName).to.be.equal(patch.fileName)
        expect(data.description).to.be.equal(patch.description)
      })
  })

  it('should archive one then removed from collection', function* () {
    const file = files[0]
    const fileId = file._id
    const nextOne = files[1]
    const response = {
      _id: fileId,
      _projectId: projectId,
      isArchived: true,
      updated: new Date().toISOString()
    }

    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    httpBackend.whenPOST(`${apihost}works/${fileId}/archive`)
      .respond(JSON.stringify(response))

    yield signal.take(1)

    yield File.archive(fileId)

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length - 1)
        expectDeepEqual(data[0], nextOne)
        expect(spy.callCount).to.be.equal(1)
      })

    // cache
    yield File.get(fileId).take(1)
      .do(data => {
        expectDeepEqual(data, Utils.assign(file, response))
        expect(spy.callCount).to.be.equal(1)
      })
  })

  it('should undo achievement then added to collection', function* () {
    file.isArchived = true
    const fileId = file._id
    const response = {
      _id: fileId,
      _projectId: projectId,
      isArchived: false,
      updated: new Date().toISOString()
    }

    httpBackend.whenGET(`${apihost}works/${file._id}`)
      .empty()
      .respond(JSON.stringify(file))

    httpBackend.whenDELETE(`${apihost}works/${fileId}/archive`)
      .respond(JSON.stringify(response))

    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    const anotherSignal = File.get(fileId)
      .publish()
      .refCount()

    // get one
    yield anotherSignal.take(1)
      .do(data => {
        expect(data.isArchived).to.be.true
      })

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length)
      })

    yield File.unarchive(fileId)

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length + 1)
        expect(data[0]._id).to.be.equal(fileId)
      })

    // cache
    yield anotherSignal.take(1)
      .do(data => {
        expect(data.isArchived).to.be.false
        expectDeepEqual(data, Utils.assign(file, response))
      })
  })

  it('should fork one then added to collection', function* () {
    const file = files[0]
    const fileId = file._id
    const misaki = Utils.clone(file)
    misaki._id = <any>uuid()

    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    httpBackend.whenPUT(`${apihost}works/${fileId}/fork`, {
        _parentId: parentId
      })
      .respond(JSON.stringify(misaki))

    yield signal.take(1)

    // new one
    yield File.fork(fileId, parentId)
      .do(data => {
        expectDeepEqual(data, misaki)
      })

    // get all files
    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length + 1)
        expectDeepEqual(data[0], misaki)
      })
  })

  it('should move one to another collection', function* () {
    const file = files[0]
    const fileId = file._id
    const nextOne = files[1]
    const anotherParentId = uuid()

    httpBackend.whenGET(`${apihost}projects/${projectId}/collections/${anotherParentId}/works`)
      .respond([])

    httpBackend.whenPUT(`${apihost}works/${fileId}/move`, {
        _parentId: anotherParentId
      })
      .respond(JSON.stringify({
        _parentId: anotherParentId
      }))

    const signal = File.getFiles(projectId, parentId)
      .publish()
      .refCount()

    const anotherSignal = File.getFiles(projectId, <any>anotherParentId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length)
      })

    yield anotherSignal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(0)
      })

    yield File.move(fileId, <any>anotherParentId)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(files.length - 1)
        expectDeepEqual(data[0], nextOne)
      })

    yield anotherSignal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(1)
        expect(data[0]._id).to.be.equal(fileId)
      })
  })

  it('should update followers', function* () {
    const fileId = file._id
    const followers = <any>Array(10).fill(null).map(() => uuid())
    const patch = {
      involveMembers: Utils.clone(followers)
    }
    const response = {
      _id: fileId,
      involveMembers: Utils.clone(followers),
      updated: new Date().toISOString()
    }

    const signal = File.get(fileId)
      .publish()
      .refCount()

    httpBackend.whenPUT(`${apihost}works/${fileId}/involveMembers`, patch)
      .respond(JSON.stringify(response))

    yield signal.take(1)

    yield File.updateInvolves(fileId, followers, 'involveMembers')

    // get one
    yield signal.take(1)
      .do(data => {
        expect(data.involveMembers).to.be.deep.equal(followers)
        expectDeepEqual(data, Utils.assign(file, response))
      })
  })
})
