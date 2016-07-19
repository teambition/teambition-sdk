'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {
  apihost,
  TaskAPI,
  TagAPI,
  Backend,
  forEach,
  clone,
  BaseFetch
} from '../index'
import { tags, task } from '../../mock/tags'
import { relatedTagTasks } from '../../mock/relatedTagTasks'
import { flush, expectDeepEqual, notInclude } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe.only('Tag API test:', () => {
  let TaskApi: TaskAPI
  let TagApi: TagAPI
  let httpBackend: Backend

  let spy: Sinon.SinonSpy

  const projectId = tags[0]._projectId

  beforeEach(() => {
    flush()
    spy = sinon.spy(BaseFetch.fetch, 'get')
    TaskApi = new TaskAPI()
    TagApi = new TagAPI()
    httpBackend = new Backend()

    httpBackend.whenGET(`${apihost}tasks/${task._id}/tags`)
      .respond(JSON.stringify(tags))

    httpBackend.whenGET(`${apihost}projects/${projectId}/tags`)
      .respond(JSON.stringify(tags))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  it('create tag should ok', done => {
    const mockTag = clone(tags[0])
    mockTag._id = 'mocktag'
    mockTag.name = 'mock tag'

    httpBackend.whenPOST(`${apihost}tags`, {
      _projectId: projectId
    })
      .respond(JSON.stringify(mockTag))

    TagApi.getByProjectId(projectId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(tags.length + 1)
        expectDeepEqual(r[0], mockTag)
        done()
      })

    TagApi.create({_projectId: projectId})
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update tag should ok', done => {
    const tagId = tags[0]._id

    httpBackend.whenGET(`${apihost}tags/${tagId}`)
      .respond(JSON.stringify(tags[0]))

    httpBackend.whenPUT(`${apihost}tags/${tagId}`, {
      color: 'red'
    }).respond({
      color: 'red'
    })

    TagApi.get(tagId)
      .skip(1)
      .subscribe(r => {
        expect(r.color).to.equal('red')
        done()
      })

    TagApi.update(tagId, {
      color: 'red'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('delete tag should ok', done => {
    const tagId = tags[0]._id

    httpBackend.whenDELETE(`${apihost}tags/${tagId}`)
      .respond({})

    TagApi.getByProjectId(projectId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(tags.length - 1)
        expect(notInclude(r, tags[0])).to.be.true
        done()
      })

    TagApi.delete(tagId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()

  })

  it('archive should ok', done => {
    const tagId = tags[0]._id

    httpBackend.whenPOST(`${apihost}tags/${tagId}/archive`)
      .respond({
        isArchived: true,
        updated: new Date().toISOString(),
        _id: tagId,
        _projectId: projectId
      })

    TagApi.getByProjectId(projectId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(tags.length - 1)
        expect(notInclude(r, tags[0])).to.be.true
        done()
      })

    TagApi.archive(tagId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('unarchive should ok', done => {
    const mockTag = clone(tags[0])
    mockTag._id = 'mocktag'
    mockTag.name = 'mock tag'
    mockTag.isArchived = true

    httpBackend.whenGET(`${apihost}tags/mocktag`)
      .respond(JSON.stringify(mockTag))

    httpBackend.whenDELETE(`${apihost}tags/mocktag/archive`)
      .respond({
        isArchived: false,
        updated: new Date().toISOString(),
        _id: 'mocktag',
        _projectId: projectId
      })

    TagApi.get('mocktag')
      .subscribe()

    TagApi.getByProjectId(projectId)
      .skip(1)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r.length).to.equal(tags.length + 1)
        done()
      })

    TagApi.unarchive('mocktag')
      .subscribeOn(Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()
  })

  it('get relatedTagTasks should ok', done => {
    const tag = tags[2]

    httpBackend.whenGET(`${apihost}tags/${tag._id}/tasks`)
      .respond(JSON.stringify(relatedTagTasks))

    TagApi.getRelated(tag._id, 'task')
      .subscribe(r => {
        forEach(r, (task, index) => {
          expectDeepEqual(task, relatedTagTasks[index])
        })
        done()
      })

    httpBackend.flush()
  })

  it('relateTag should ok', done => {
    const tag = tags[2]
    const mockTask = clone(relatedTagTasks[0])
    mockTask._id = 'mocktaskid'
    mockTask.tagIds = ['haha', 'heihei']

    httpBackend.whenGET(`${apihost}tags/${tag._id}/tasks`)
      .respond(JSON.stringify(relatedTagTasks))

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))

    httpBackend.whenPUT(`${apihost}tasks/${mockTask._id}/tags/${tag._id}`)
      .respond({
        _id: mockTask._id,
        tagIds: ['haha', 'heihei', tag._id],
        updated: new Date().toISOString()
      })

    TaskApi.get(mockTask._id)
      .subscribe()

    TagApi.getRelated(tag._id, 'task')
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(relatedTagTasks.length + 1)
        expect(r[0].tagIds).to.deep.equal(['haha', 'heihei', tag._id])
        done()
      })

    TagApi.relateTag(mockTask._id, 'task', tag._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })
})
