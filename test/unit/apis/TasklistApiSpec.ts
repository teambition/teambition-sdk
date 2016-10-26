'use strict'
import * as chai from 'chai'
import { apihost, TasklistAPI, Backend, clone } from '../index'
import { tasklists } from '../../mock/tasklists'
import { notInclude, flush, expectDeepEqual } from '../utils'

const expect = chai.expect

export default describe('tasklist api test:', () => {
  let httpBackend: Backend
  let Tasklist: TasklistAPI
  let projectId: any

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Tasklist = new TasklistAPI()
    projectId = tasklists[0]._projectId

    httpBackend.whenGET(`${apihost}projects/${projectId}/tasklists`)
      .respond(JSON.stringify(tasklists))
  })

  after(() => {
    httpBackend.restore()
  })

  it('create tasklist should ok', done => {
    const mockTasklist = clone(tasklists[0])
    mockTasklist._id = 'mocktasklistid'
    mockTasklist.title = 'mocktasklist'

    httpBackend.whenPOST(`${apihost}tasklists`, {
      title: 'mocktasklist',
      _projectId: projectId
    })
      .respond(JSON.stringify(mockTasklist))

    Tasklist.create(<any>{
      title: 'mocktasklist',
      _projectId: projectId
    })
      .subscribe(r => {
        expectDeepEqual(r, mockTasklist)
        done()
      })
  })

  it('get tasklists by projectId should ok', done => {
    Tasklist.getTasklists(projectId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        done()
      })
  })

  it('get tasklist by tasklist id should ok', done => {
    const tasklist = tasklists[0]

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    Tasklist.getOne(tasklist._id)
      .subscribe(data => {
        expectDeepEqual(data, tasklist)
        done()
      })
  })

  it('update tasklist should ok', function* () {
    const tasklistId = tasklists[0]._id
    const patch = {
      title: 'tasklist update test'
    }

    httpBackend.whenGET(`${apihost}tasklists/${tasklistId}`)
      .respond(JSON.stringify(tasklists[0]))

    httpBackend.whenPUT(`${apihost}tasklists/${tasklistId}`, patch)
      .respond(JSON.stringify(patch))

    const signal = Tasklist.getOne(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Tasklist.update(tasklistId, patch)
      .do(r => {
        expect(r).to.deep.equal({
          title: 'tasklist update test'
        })
      })

    yield signal.take(1)
      .do(data => {
        expect(data.title).to.equal(patch.title)
      })

  })

  it('delete tasklist should ok', function* () {
    const tasklist = tasklists[0]
    const tasklistId = tasklist._id
    const length = tasklists.length

    httpBackend.whenDELETE(`${apihost}tasklists/${tasklistId}`)
      .respond({})

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    const signal = Tasklist.getTasklists(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data).to.be.null
      })

    yield Tasklist.delete(tasklistId)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(length - 1)
        expect(notInclude(data, tasklists[0])).to.be.true
      })
  })

  it('archive tasklist should ok', function* () {
    const tasklist = tasklists[0]
    const tasklistId = tasklist._id
    const length = tasklists.length
    const mockResponse = {
      _id: tasklistId,
      isArchived: true,
      updated: Date.now()
    }

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    httpBackend.whenPOST(`${apihost}tasklists/${tasklistId}/archive`)
      .respond(JSON.stringify(mockResponse))

    const signal = Tasklist.getTasklists(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.isArchived).to.be.true
      })

    yield Tasklist.archive(tasklistId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.length).is.equal(length - 1)
        expect(notInclude(data, tasklists[0])).to.be.true
      })
  })

  it('unarchive tasklist should ok', function* () {
    const tasklist = clone(tasklists[0])
    tasklist.isArchived = true
    tasklist._id = 'unarchivetasklisttest'
    const length = tasklists.length
    const tasklistId = tasklist._id

    const mockResponse = {
      _id: tasklistId,
      _projectId: projectId,
      isArchived: false,
      updated: Date.now()
    }

    httpBackend.whenGET(`${apihost}tasklists/${tasklistId}`)
      .respond(JSON.stringify(tasklist))

    httpBackend.whenDELETE(`${apihost}tasklists/${tasklistId}/archive`)
      .respond(JSON.stringify(mockResponse))

    const signal = Tasklist.getTasklists(projectId)
      .publish()
      .refCount()

    const signal2 = Tasklist.getOne(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield signal2.take(1)

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.isArchived).to.be.false
      })

    yield Tasklist.unArchive(<any>'unarchivetasklisttest')
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(length + 1)
        expect(data[0]._id).to.equal('unarchivetasklisttest')
      })
  })
})
