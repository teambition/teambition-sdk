'use strict'
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

export default describe('Tag API test:', () => {
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

  it('create tag should ok', function* () {
    const mockTag = clone(tags[0])
    mockTag._id = 'mocktag'
    mockTag.name = 'mock tag'

    httpBackend.whenPOST(`${apihost}tags`, {
      _projectId: projectId
    })
      .respond(JSON.stringify(mockTag))

    const signal = TagApi.getByProjectId(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield TagApi.create({_projectId: projectId})

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(tags.length + 1)
        expectDeepEqual(r[0], mockTag)
      })
  })

  it('update tag should ok', function* () {
    const tagId = tags[0]._id

    httpBackend.whenGET(`${apihost}tags/${tagId}`)
      .respond(JSON.stringify(tags[0]))

    httpBackend.whenPUT(`${apihost}tags/${tagId}`, {
      color: 'red'
    })
      .respond({
        color: 'red'
      })

    const signal = TagApi.get(tagId)

    yield signal.take(1)

    yield TagApi.update(tagId, {
      color: 'red'
    })

    yield signal.take(1)
      .do(r => {
        expect(r.color).to.equal('red')
      })
  })

  it('delete tag should ok', function* () {
    const tagId = tags[0]._id

    httpBackend.whenDELETE(`${apihost}tags/${tagId}`)
      .respond({})

    const signal = TagApi.getByProjectId(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield TagApi.delete(tagId)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(tags.length - 1)
        expect(notInclude(r, tags[0])).to.be.true
      })

  })

  it('archive should ok', function* () {
    const tagId = tags[0]._id

    httpBackend.whenPOST(`${apihost}tags/${tagId}/archive`)
      .respond({
        isArchived: true,
        updated: new Date().toISOString(),
        _id: tagId,
        _projectId: projectId
      })

    const signal = TagApi.getByProjectId(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield TagApi.archive(tagId)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(tags.length - 1)
        expect(notInclude(r, tags[0])).to.be.true
      })
  })

  it('unarchive should ok', function* () {
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

    yield TagApi.get(<any>'mocktag')
      .take(1)

    const signal = TagApi.getByProjectId(projectId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield TagApi.unarchive(<any>'mocktag')

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(tags.length + 1)
      })
  })

  it('get relatedTagTasks should ok', function* () {
    const tag = tags[2]

    httpBackend.whenGET(`${apihost}tags/${tag._id}/tasks`)
      .respond(JSON.stringify(relatedTagTasks))

    yield TagApi.getRelated(tag._id, 'task')
      .take(1)
      .do(r => {
        forEach(r, (task, index) => {
          expectDeepEqual(task, relatedTagTasks[index])
        })
      })
  })

  it('relateTag should ok', function* () {
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

    yield TaskApi.get(<any>mockTask._id)
      .take(1)

    const signal = TagApi.getRelated(tag._id, 'task')
      .publish()
      .refCount()

    yield signal.take(1)

    yield TagApi.relateTag(<any>mockTask._id, 'task', tag._id)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(relatedTagTasks.length + 1)
        expect(r[0].tagIds).to.deep.equal(['haha', 'heihei', tag._id])
      })
  })
})
