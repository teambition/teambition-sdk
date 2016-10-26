'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {
  apihost,
  SubtaskAPI,
  Backend,
  forEach,
  clone,
  BaseFetch
} from '../index'
import { organizations } from '../../mock/organizations'
import { subtasks } from '../../mock/subtasks'
import { organizationMySubtasks } from '../../mock/organizationMySubtasks'
import { organizationMyDueSubtasks } from '../../mock/organizationMyDueSubtasks'
import { organizationMyDoneSubtasks } from '../../mock/organizationMyDoneSubtasks'
import { organizationMyCreatedSubtasks } from '../../mock/organizationMyCreatedSubtasks'
import { flush, expectDeepEqual, notInclude } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Subtask API test: ', () => {
  let Subtask: SubtaskAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  const organization = organizations[0]
  const organizationId = organization._id
  const userId = organizationMySubtasks[0]._executorId

  const subtaskId: any = 'mocksubtask'
  const subtask = clone(subtasks[0])

  subtask._id = subtaskId

  beforeEach(() => {
    flush()
    spy = sinon.spy(BaseFetch.fetch, 'get')
    Subtask = new SubtaskAPI()
    httpBackend = new Backend()

    httpBackend.whenGET(`${apihost}subtasks/${subtaskId}`)
      .respond(JSON.stringify(subtask))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get organization my subtasks without dueDate: ', () => {
    const page1 = organizationMySubtasks.slice(0, 30)

    const page2 = organizationMySubtasks.slice(30, 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrgMySubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          done()
        })

    })

    it('get page2 should ok', function* () {
      const signal = Subtask.getOrgMySubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.getOrgMySubtasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })

    })

    it('get from cache should ok', function* () {
      yield Subtask.getOrgMySubtasks(userId, organization)
        .take(1)

      yield Subtask.getOrgMySubtasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('add subtask should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockmysubtasktest'

      httpBackend.whenGET(`${apihost}subtasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Subtask.getOrgMySubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.get(mockGet._id)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })
    })

    it('delete subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}subtasks/${mockId}`)
        .respond({})

      const signal = Subtask.getOrgMySubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })

    it('done subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenPUT(`${apihost}subtasks/${mockId}/isDone`, {
        isDone: true
      })
        .respond({
          _id: mockId,
          isDone: true,
          updated: Date.now()
        })

      const signal = Subtask.getOrgMySubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.updateStatus(mockId, true)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })
  })

  describe('get organization my subtasks have dueDate: ', () => {
    const page1 = organizationMyDueSubtasks.slice(0, 30)

    const page2 = organizationMyDueSubtasks.slice(30, 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrgMyDueSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

    })

    it('get page2 should ok', function* () {
      const signal = Subtask.getOrgMyDueSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.getOrgMyDueSubtasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })

    })

    it('get from cache should ok', function* () {
      yield Subtask.getOrgMyDueSubtasks(userId, organization)
        .take(1)

      yield Subtask.getOrgMyDueSubtasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          expect(spy).to.be.calledOnce
        })

    })

    it('add subtask should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockmysubtasktest'

      httpBackend.whenGET(`${apihost}subtasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Subtask.getOrgMyDueSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.get(mockGet._id)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })

    })

    it('delete subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}subtasks/${mockId}`)
        .respond({})

      const signal = Subtask.getOrgMyDueSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })

    it('done subtask should ok', function* () {
      const mockId = page1[0]._id
      const mockResponse = {
        _id: mockId,
        isDone: true,
        updated: Date.now()
      }

      httpBackend.whenPUT(`${apihost}subtasks/${mockId}/isDone`, {
        isDone: true
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Subtask.getOrgMyDueSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.updateStatus(mockId, true)
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })
  })

  describe('get organization my subtasks done: ', () => {
    const page1 = organizationMyDoneSubtasks.slice(0, 30)

    const page2 = organizationMyDoneSubtasks.slice(30, 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=true`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=true`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrgMyDoneSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

    })

    it('get page2 should ok', function* () {
      const signal = Subtask.getOrgMyDoneSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.getOrgMyDoneSubtasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })

    })

    it('get from cache should ok', function* () {
      yield Subtask.getOrgMyDoneSubtasks(userId, organization)
        .take(1)

      yield Subtask.getOrgMyDoneSubtasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          expect(spy).to.be.calledOnce
        })

    })

    it('add subtask should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockmysubtasktest'

      httpBackend.whenGET(`${apihost}subtasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Subtask.getOrgMyDoneSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.get(mockGet._id)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })

    })

    it('delete subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}subtasks/${mockId}`)
        .respond({})

      const signal = Subtask.getOrgMyDoneSubtasks(userId, organization)
        .publish()
        .refCount()
      yield signal.take(1)

      yield Subtask.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })
  })

  describe('get organization my created subtasks:', () => {
    const page1 = organizationMyCreatedSubtasks.slice(0, 30)

    const page2 = organizationMyCreatedSubtasks.slice(30, 60)

    const maxId = page1[page1.length - 1]._id

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me/created?page=1`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me/created?page=2&maxId=${maxId}`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          done()
        })

    })

    it('get page2 should ok', function* () {
      const signal = Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.getOrgMyCreatedSubtasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })
    })

    it('get from cache should ok', function* () {
      yield Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .take(1)

      yield Subtask.getOrgMyCreatedSubtasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          expect(spy).to.be.calledOnce
        })

    })

    it('get empty array when no data', done => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me/created?page=1`)
        .empty()
        .respond([])

      Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.deep.equal([])
          done()
        })

    })

    it('add subtask should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockmysubtasktest'

      httpBackend.whenGET(`${apihost}subtasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.get(mockGet._id)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })

    })

    it('update subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenPUT(`${apihost}subtasks/${mockId}/content`, {
        content: 'mocktest'
      })
        .respond({
          _id: mockId,
          content: 'mocktest',
          updated: new Date().toISOString()
        })

      const signal = Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.updateContent(mockId, 'mocktest')

      yield signal.take(1)
        .do(data => {
          expect(data[0].content).to.equal('mocktest')
        })

    })

    it('delete subtask should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}subtasks/${mockId}`)
        .respond({})

      const signal = Subtask.getOrgMyCreatedSubtasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Subtask.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })

    })
  })

  it('get subtasks from Task should ok', done => {
    const taskId = subtasks[0]._taskId

    httpBackend.whenGET(`${apihost}tasks/${taskId}/subtasks`)
      .respond(JSON.stringify(subtasks))

    Subtask.getFromTask(taskId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        forEach(data, (subtask, pos) => {
          expectDeepEqual(subtask, subtasks[pos])
        })
        done()
      })
  })

  it('add to subtask to task should ok', function* () {
    const taskId = subtasks[0]._taskId

    httpBackend.whenGET(`${apihost}tasks/${taskId}/subtasks`)
      .respond(JSON.stringify(subtasks))

    const signal = Subtask.getFromTask(taskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.get(subtaskId).take(1)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(subtasks.length + 1)
        expectDeepEqual(data[0], subtask)
      })
  })

  it('get task should ok', done => {
    Subtask.get(subtaskId)
      .subscribe(data => {
        expectDeepEqual(data, subtask)
        done()
      })
  })

  it('create subtask should ok', function* () {
    const createSubtaskData = {
      content: 'subtask create test',
      _taskId: '573c3442dc7658916f7b10e5',
      _executorId: '56986d43542ce1a2798c8cfb'
    }
    const result = {
      _id: 'subtaskcreatetest',
      content: 'subtask create test',
      _taskId: '573c3442dc7658916f7b10e5',
      _executorId: '56986d43542ce1a2798c8cfb',
      _projectId: '573c3442dc7658916f7b10e5'
    }
    httpBackend.whenPOST(`${apihost}subtasks`, createSubtaskData)
      .respond(JSON.stringify(result))

    yield Subtask.create(<any>createSubtaskData)
      .do(data => {
        expectDeepEqual(data, result)
      })
  })

  it('delete subtask should ok', function* () {
    httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
      .respond({})

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    signal.skip(1)
      .subscribe(data => {
        expect(data).to.be.null
      })

    yield Subtask.delete(subtaskId)

  })

  it('delete subtask and get subtasks from task should ok', function* () {
    const subtask = subtasks[0]
    const taskId = subtask._taskId
    const subtaskId = subtask._id
    const nextSubtask = subtasks[1]

    httpBackend.whenGET(`${apihost}tasks/${taskId}/subtasks`)
      .respond(JSON.stringify(subtasks))

    httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
      .respond({})

    const signal = Subtask.getFromTask(taskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.delete(subtaskId)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(subtasks.length - 1)
        expectDeepEqual(data[0], nextSubtask)
      })
  })

  it('update subtask should ok', function* () {
    const dueDate = new Date().toISOString()
    const mockResponse = {
      content: 'test',
      dueDate: dueDate,
      updated: new Date().toISOString()
    }
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}`, {
      content: 'test',
      dueDate: dueDate
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.update(subtaskId, {
      content: 'test',
      dueDate: dueDate
    })
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.content).to.equal('test')
        expect(data.dueDate).to.equal(dueDate)
      })
  })

  it('transform subtask should ok', function* () {
    const mockResponse = {
      _id: subtaskId,
      _projectId: subtask._projectId,
      _tasklistId: 'aaa',
      _stageId: 'xxx',
      content: subtask.content
    }

    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/transform`, {
      doLink: false,
      doLinked: false
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    signal.skip(1)
      .subscribe(data => {
        expect(data).to.be.null
      })

    yield Subtask.transform(subtaskId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })
  })

  it('update content should ok', function* () {
    const mockResponse = {
      _id: subtaskId,
      content: 'update content test',
      updated: new Date().toISOString()
    }
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/content`, {
      content: 'update content test'
    }).respond(JSON.stringify(mockResponse))

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.updateContent(subtaskId, 'update content test')
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.content).to.equal('update content test')
      })
  })

  it('update dueDate should ok', function* () {
    const dueDate = new Date().toISOString()
    const mockResponse = {
      _id: subtaskId,
      dueDate: dueDate,
      updated: new Date().toISOString()
    }
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/dueDate`, {
      dueDate: dueDate
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.updateDuedate(subtaskId, dueDate)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.dueDate).to.equal(dueDate)
      })
  })

  it('update error format dueDate should be caught', function* () {
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/dueDate`, {
      dueDate: 'xxx'
    }).error('dueDate must be ISOString', {
      status: 400,
      statusText: 'bad request'
    })

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.updateDuedate(subtaskId, 'xxx')
      .catch((err: Response) => {
        return err.text()
      })
      .do(r => {
        expect(r).to.equal('dueDate must be ISOString')
      })
  })

  it('update subtask statu should ok', function* () {
    const mockResponse = {
      _id: subtaskId,
      isDone: true,
      updated: new Date().toISOString()
    }
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
      isDone: true
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Subtask.get(subtaskId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Subtask.updateStatus(subtaskId, true)
      .do(data => {
        expect(data).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.isDone).to.be.true
      })
  })

})
