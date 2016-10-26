'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {
  apihost,
  TaskAPI,
  Backend,
  forEach,
  clone,
  OrganizationSchema,
  BaseFetch,
  concat
} from '../index'
import { flush, expectDeepEqual, notInclude } from '../utils'
import { tasksDone } from '../../mock/tasksDone'
import { tasksUndone } from '../../mock/tasksUndone'
import { organizations } from '../../mock/organizations'
import { projects } from '../../mock/projects'
import { projectTasks } from '../../mock/projectTasks'
import { projectDoneTasks } from '../../mock/projectDoneTasks'
import { organizationMyDueTasks } from '../../mock/organizationMyDueTasks'
import { organizationMyTasks } from '../../mock/organizationMyTasks'
import { organizationMyDoneTasks } from '../../mock/organizationMyDoneTasks'
import { organizationMyCreatedTasks } from '../../mock/organizationMyCreatedTasks'
import { organizationMyInvolvesTasks } from '../../mock/organizationMyInvolvesTasks'
import { tasklists } from '../../mock/tasklists'
import { tasksOneDayMe } from '../../mock/tasksOneDayMe'
import { stageTasksUndone } from '../../mock/stageTasksUndone'
import { stageTasksDone } from '../../mock/stageTasksDone'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Task API test: ', () => {
  let Task: TaskAPI
  let httpBackend: Backend

  let spy: Sinon.SinonSpy

  const userId = organizationMyTasks[0]._executorId

  beforeEach(() => {
    flush()
    spy = sinon.spy(BaseFetch.fetch, 'get')
    Task = new TaskAPI()
    httpBackend = new Backend()
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get tasks by tasklist id: ', () => {
    const tasklistId = tasksDone[0]._tasklistId

    const mockTask = clone(tasksUndone[0])
    mockTask._id = 'mocktaskundone'
    const mockTaskDone = clone(tasksDone[0])
    mockTaskDone._id = 'mocktaskdone'

    const page1 = tasksDone.slice(0, 30)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=false`)
        .respond(JSON.stringify(tasksUndone))

      httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
        .respond(JSON.stringify(mockTask))

      httpBackend.whenGET(`${apihost}tasks/${mockTaskDone._id}`)
        .respond(JSON.stringify(mockTaskDone))

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))
    })

    after(() => {
      httpBackend.restore()
    })

    it('get tasks undone should ok', done => {
      Task.getTasklistUndone(tasklistId)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          done()
        })
    })

    it('network error should be handed', done => {
      httpBackend.whenGET(`${apihost}tasklists/error/tasks?isDone=false`)
        .error('Unauthorize', {
          status: 401
        })

      Task.getTasklistUndone(<any>'error')
        .catch((err: Response) => {
          return err.text()
        })
        .subscribe({
          next: r => {
            expect(r).to.equal('Unauthorize')
            done()
          }
        })
    })

    it('get tasks done should ok', done => {
      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))

      Task.getTasklistDone(tasklistId)
        .subscribe(data => {
          expect(data.length).to.equal(30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          done()
        })
    })

    it('get tasks done next page should ok', function* () {
      const page1 = clone(tasksDone).slice(0, 30)

      const page2 = clone(tasksDone).slice(30)

      const length = page2.length

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=2&limit=30`)
        .respond(JSON.stringify(page2))

      const signal = Task.getTasklistDone(tasklistId)
        .publish()
        .refCount()

      yield signal.take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
        })

      yield Task.getTasklistDone(tasklistId, 2)
        .take(1)
        .do(data => {
          expect(data.length).to.equal(length)
        })

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(length + 30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
      })
    })

    it('get tasks done from cache should ok', function* () {
      const page1 = clone(tasksDone).slice(0, 30)

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))

      yield Task.getTasklistDone(tasklistId).take(1)

      yield Task.getTasklistDone(tasklistId)
        .take(1)
        .do(data => {
          expect(data.length).to.equal(30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
          expect(spy).to.be.calledOnce
        })

    })

    it('get tasks concurrency should ok', function* () {

      yield [
        Task.getTasklistDone(tasklistId).take(1),

        Task.getTasklistDone(tasklistId).take(1),

        Task.getTasklistDone(tasklistId).take(1),

        Task.getTasklistDone(tasklistId).take(1)
      ]

      yield Task.getTasklistDone(tasklistId)
        .take(1)
        .do(data => {
          expect(data.length).to.equal(30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
        })

    })

    it('add task to task undone should ok', function* () {
      const length = tasksUndone.length

      const signal = Task.getTasklistUndone(tasklistId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(<any>'mocktaskundone').take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(length + 1)
          expect(data[0]._id).to.equal('mocktaskundone')
        })
    })

    it('undone task should ok', function* () {
      const mockDoneTask = clone(tasksDone[0])
      const length = tasksUndone.length
      const updated = new Date().toISOString()
      mockDoneTask.updated = updated
      const mockResponse = {
        _id: mockDoneTask._id,
        isDone: false,
        updated: updated
      }

      httpBackend.whenGET(`${apihost}tasks/${mockDoneTask._id}`)
        .respond(JSON.stringify(mockDoneTask))

      httpBackend.whenPUT(`${apihost}tasks/${mockDoneTask._id}/isDone`, {
        isDone: false
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.getTasklistUndone(tasklistId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockDoneTask._id).take(1)

      yield Task.updateStatus(mockDoneTask._id, false)
        .do(r => {
          expectDeepEqual(r, mockResponse)
        })

      yield Task.getTasklistUndone(tasklistId)
        .take(1)
        .do(tasks => {
          expect(tasks.length).to.equal(length + 1)
          forEach(tasks[0], (ele, key) => {
            if (key !== '_requested' && (key !== '$$schemaName')) {
              if (key !== 'isDone') {
                expect(ele).to.deep.equal(mockDoneTask[key])
              } else {
                expect(ele).to.equal(!mockDoneTask[key])
              }
            }
          })
        })

    })

    it('add task to task done should ok', function* () {
      const signal = Task.getTasklistDone(tasklistId)

      yield Task.get(<any>'mocktaskdone').take(1)

      signal.take(1)
        .do(data => {
          expect(data.length).to.equal(31)
          expect(data[0]._id).to.equal('mocktaskdone')
        })
    })
  })

  describe('get organization tasks: ', () => {
    const organization: OrganizationSchema = organizations[0]
    const organizationId = organization._id

    const mockTaskDue = clone(organizationMyDueTasks[0])
    mockTaskDue._id = 'mocktaskdue'
    const mockTaskNodue = clone(organizationMyTasks[0])
    mockTaskNodue._id = 'mocktasknodue'
    const mockTaskDone = clone(organizationMyDoneTasks[0])
    mockTaskDone._id = 'mocktaskdone'

    const duepage1 = organizationMyDueTasks.slice(0, 30)

    const duepage2 = organizationMyDueTasks.slice(30, 60)

    const taskspage1 = organizationMyTasks.slice(0, 30)

    const taskspage2 = organizationMyTasks.slice(30, 60)

    const tasksdonepage1 = organizationMyDoneTasks.slice(0, 30)

    const tasksdonepage2 = organizationMyDoneTasks.slice(30, 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(duepage1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(duepage2))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(taskspage1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(taskspage2))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=true`)
        .respond(JSON.stringify(tasksdonepage1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=true`)
        .respond(JSON.stringify(tasksdonepage2))

      httpBackend.whenGET(`${apihost}tasks/${mockTaskDue._id}`)
        .respond(JSON.stringify(mockTaskDue))

      httpBackend.whenGET(`${apihost}tasks/${mockTaskNodue._id}`)
        .respond(JSON.stringify(mockTaskNodue))

      httpBackend.whenGET(`${apihost}tasks/${mockTaskDone._id}`)
        .respond(JSON.stringify(mockTaskDone))

    })

    it('get my tasks has dueDate should ok', done => {
      Task.getOrgMyDueTasks(userId, organization)
        .subscribe(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, duepage1[index])
          })
          done()
        })
    })

    it('get my dueDate tasks more page has should ok', function* () {
      const signal = Task.getOrgMyDueTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.getOrgMyDueTasks(userId, organization, 2).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(duepage2.length + 30)
        })
    })

    it('get my tasks has dueDate from cache should ok', function* () {

      yield Task.getOrgMyDueTasks(userId, organization)
        .take(1)

      yield Task.getOrgMyDueTasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, duepage1[index])
          })
        })
    })

    it('add my tasks has dueDate should ok', function* () {
      const signal = Task.getOrgMyDueTasks(userId, organization)

      yield signal.take(1)

      yield Task.get(mockTaskDue._id).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data[0]._id).to.equal('mocktaskdue')
        })
    })

    it('delete task from my tasks has dueDate should ok', function* () {
      const task = organizationMyDueTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      const signal = Task.getOrgMyDueTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(task._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })

    })

    it('done task from my tasks has dueDate should ok', function* () {
      const task = organizationMyDueTasks[0]
      const mockResponse = {
        _id: task._id,
        isDone: true,
        updated: Date.now()
      }

      httpBackend.whenPUT(`${apihost}tasks/${task._id}/isDone`, {
        isDone: true
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.getOrgMyDueTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateStatus(task._id, true)
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })
    })

    it('get my tasks has no dueDate should ok', function* () {

      yield Task.getOrgMyTasks(userId, organization)
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, taskspage1[pos])
          })
        })

    })

    it('get my tasks page 2 should ok', function* () {

      const signal = Task.getOrgMyTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.getOrgMyTasks(userId, organization, 2).take(1)

      signal.take(1)
        .do(data => {
          expect(data.length).to.equal(taskspage2.length + 30)
        })
    })

    it('get my tasks from cache should ok', function* () {

      yield Task.getOrgMyTasks(userId, organization).take(1)

      yield Task.getOrgMyTasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, taskspage1[index])
          })
          expect(spy).to.have.calledOnce
        })
    })

    it('add my tasks no dueDate should ok', function* () {

      const signal = Task.getOrgMyTasks(userId, organization)

      yield signal.take(1)

      yield Task.get(mockTaskNodue._id).take(1)

      yield signal.take(1)
        .subscribe(data => {
          expect(data[0]._id).to.equal('mocktasknodue')
        })
    })

    it('delete task from my tasks no dueDate should ok', function* () {
      const task = organizationMyTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      const signal = Task.getOrgMyTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(task._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })
    })

    it('done task from my tasks no dueDate should ok', function* () {
      const task = organizationMyTasks[0]

      httpBackend.whenPUT(`${apihost}tasks/${task._id}/isDone`, {
        isDone: true
      })
        .respond({
          _id: task._id,
          isDone: true,
          updated: Date.now()
        })

      const signal = Task.getOrgMyTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateStatus(task._id, true)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })
    })

    it('get my tasks done should ok', function* () {

      yield Task.getOrgMyDoneTasks(userId, organization)
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksdonepage1[pos])
          })
        })
    })

    it('get my tasks done more page should ok', function* () {
      const signal = Task.getOrgMyDoneTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.getOrgMyDoneTasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksdonepage2.length + 30)
        })
    })

    it('get my tasks done from cache should ok', function* () {

      yield Task.getOrgMyDoneTasks(userId, organization)
        .take(1)

      yield Task.getOrgMyDoneTasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksdonepage1[pos])
          })
          expect(spy).to.have.calledOnce
        })
    })

    it('add my tasks done should ok', function* () {
      const signal = Task.getOrgMyDoneTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockTaskDone._id).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(31)
          expectDeepEqual(data[0], mockTaskDone)
        })
    })

    it('delete task from my tasks done should ok', function* () {
      const task = organizationMyDoneTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      const signal = Task.getOrgMyDoneTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(task._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })
    })

  })

  describe('get my tasks has dueDate: ', () => {
    const _userId = tasksOneDayMe[0]._executorId
    const mockTaskGet = clone(tasksOneDayMe[0])

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=true&isDone=false`)
        .respond(JSON.stringify(tasksOneDayMe))
    })

    it('get should ok', done => {
      Task.getMyDueTasks(_userId)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksOneDayMe[pos])
          })
          done()
        })
    })

    it('update task dueDate should ok', function* () {

      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: null
      }).respond({
        dueDate: null
      })

      const signal = Task.getMyDueTasks(_userId)
        .publish()
        .refCount()

      yield signal.take(1)

      const signal2 = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal2.take(1)

      yield Task.updateDueDate(mockTaskGet._id, null)

      yield signal2.take(1)
        .do(data => {
          expect(data.dueDate).to.equal(null)
        })

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
        })
    })

    it('delete task should ok', function* () {
      const task = tasksOneDayMe[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      const signal = Task.getMyDueTasks(userId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(task._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          expect(notInclude(data, task))
        })

    })

  })

  describe('get my tasks no dueDate: ', () => {
    const _userId = tasksOneDayMe[0]._executorId
    const mockTaskGet = clone(tasksOneDayMe[0])
    const mockTasks = clone(tasksOneDayMe).map(v => {
      v.dueDate = null
      return v
    })

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=false&isDone=false`)
        .respond(JSON.stringify(mockTasks))
    })

    it('get should ok', done => {
      Task.getMyTasks(_userId)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, mockTasks[pos])
          })
          done()
        })
    })

    it('update task dueDate should ok', function* () {
      const dueDate = new Date().toISOString()
      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: dueDate
      }).respond({
        dueDate: dueDate
      })

      const signal = Task.getMyTasks(_userId)
        .publish()
        .refCount()

      yield signal.take(1)

      const signal2 = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal2.take(1)

      yield Task.updateDueDate(mockTaskGet._id, dueDate)

      signal2.take(1)
        .do(data => {
          expect(data.dueDate).to.equal(dueDate)
        })

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
        })
    })

    it('delete task should ok', function* () {
      const task = tasksOneDayMe[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      const signal = Task.getMyTasks(userId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(task._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          expect(notInclude(data, task))
        })
    })

  })

  describe('get organization created tasks: ', () => {
    const organization: OrganizationSchema = organizations[0]
    const organizationId = organization._id

    const page1 = organizationMyCreatedTasks.slice(0, 30)

    const page2 = organizationMyCreatedTasks.slice(30, 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/created?page=1`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/created?page=2&maxId=${page1[page1.length - 1]._id}`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Task.getOrgMyCreatedTasks(userId, organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })
    })

    it('get page2 should ok', function* () {
      const signal = Task.getOrgMyCreatedTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.getOrgMyCreatedTasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })
    })

    it('get from cache should ok', function* () {

      yield Task.getOrgMyCreatedTasks(userId, organization)
        .take(1)

      yield Task.getOrgMyCreatedTasks(userId, organization, 1)
        .take(1)
        .do(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
        })
    })

    it('get empty array when no data', function* () {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/created?page=1`)
        .empty()
        .respond([])

      yield Task.getOrgMyCreatedTasks(userId, organization)
        .take(1)
        .do(data => {
          expect(data).to.be.deep.equal([])
        })
    })

    it('add task should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockcreatedtasktest'

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Task.getOrgMyCreatedTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockGet._id).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })
    })

    it('delete should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      const signal = Task.getOrgMyCreatedTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })
    })
  })

  describe('get project tasks: ', () => {
    const project = projects[0]
    const projectId = project._id

    const page1 = projectTasks.slice(0, 30)

    const page2 = projectTasks.slice(30, 60)

    const donePage1 = projectDoneTasks.slice(0, 20)

    const donePage2 = projectDoneTasks.slice(20, 50)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/tasks?page=1`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/tasks?page=2`)
        .respond(JSON.stringify(page2))

      httpBackend.whenGET(`${apihost}projects/${projectId}/tasks?page=1&isDone=true`)
        .respond(JSON.stringify(donePage1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/tasks?page=2&isDone=true`)
        .respond(JSON.stringify(donePage2))
    })

    it('get should ok', function* () {
      yield Task.getProjectTasks(projectId, {
        page: 1
      })
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
            expect(task.isDone).to.equal(false)
          })
        })
    })

    it('get done tasks should ok', function* () {
      yield Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, donePage1[pos])
            expect(task.isDone).to.equal(true)
          })
        })
    })

    it('get page2 should ok', function* () {
      const signal = Task.getProjectTasks(projectId, {
        page: 1
      })

      yield signal.take(1)

      yield Task.getProjectTasks(projectId, {
        page: 2
      })
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          forEach(data, (task, pos) => {
            expect(task.isDone).to.equal(false)
          })
        })
    })

    it('get done page2 should ok', function* () {
      const signal = Task.getProjectDoneTasks(projectId, {
        page: 1
      })

      yield signal.take(1)

      yield Task.getProjectDoneTasks(projectId, {
        page: 2
      })
        .take(1)

      yield signal.take(1)
        .subscribe(data => {
          expect(data.length).to.equal(donePage1.length + donePage2.length)
          forEach(data, (task, pos) => {
            expect(task.isDone).to.equal(true)
          })
        })
    })

    it('get from cache should ok', function* () {

      yield Task.getProjectTasks(projectId, {
        page: 1
      })
        .take(1)

      yield Task.getProjectTasks(projectId, {
        page: 1
      })
        .take(1)
        .do(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
        })
    })

    it('get done tasks from cache should ok', function* () {

      yield Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .take(1)

      yield Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .take(1)
        .do(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, donePage1[pos])
          })
        })
    })

    it('add task should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockcreatedtasktest'
      mockGet._projectId = projectId

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Task.getProjectTasks(projectId, {
        page: 1
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockGet._id)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })
    })

    it('add done task should ok', function* () {
      const mockGet = clone(donePage1[0])
      mockGet._id = 'mockcreateddonetasktest'
      mockGet._projectId = projectId

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockGet._id).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(donePage1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })
    })

    it('delete should ok', function* () {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      const signal = Task.getProjectTasks(projectId, {
        page: 1
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(mockId)

      yield signal.take(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })
    })

    it('delete done task should ok', function* () {
      const mockId = donePage1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      const signal = Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(mockId)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(donePage1.length - 1)
          expect(notInclude(data, donePage1[0])).to.be.true
        })

    })
  })

  describe('get organization involves tasks: ', () => {
    const organization: OrganizationSchema = organizations[0]
    const organizationId = organization._id

    const page1 = organizationMyInvolvesTasks.slice(0, 30)

    const page2 = organizationMyInvolvesTasks.slice(30, 60)

    const maxId = page1[page1.length - 1]._id

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/involves?page=1`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/involves?page=2&maxId=${maxId}`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', function* () {

      yield Task.getOrgMyInvolvesTasks(userId, organization)
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
        })
    })

    it('get page2 should ok', function* () {
      const signal = Task.getOrgMyInvolvesTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.getOrgMyInvolvesTasks(userId, organization, 2)
        .take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + page2.length)
        })
    })

    it('get from cache should ok', function* () {

      yield Task.getOrgMyInvolvesTasks(userId, organization)
        .take(1)

      yield Task.getOrgMyInvolvesTasks(userId, organization, 1)
        .take(1)
        .do(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('add a task should ok', function* () {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockinvolvestasks'

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      const signal = Task.getOrgMyInvolvesTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.get(mockGet._id).take(1)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
        })
    })

    it('delete a task should ok', function* () {
      httpBackend.whenDELETE(`${apihost}tasks/${page1[0]._id}`)
        .respond({})

      const signal = Task.getOrgMyInvolvesTasks(userId, organization)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(page1[0]._id)

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
        })
    })

  })

  describe('stage tasks: ', () => {

    const stageId = stageTasksUndone[0]._stageId
    const stageDoneTask = clone(stageTasksDone[0])
    const stageTasksDonePage1 = clone(stageTasksDone.slice(0, 30))
    const stageTasksDonePage2 = clone(stageTasksDone.slice(30, 60))

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks`)
        .respond(JSON.stringify(stageTasksUndone))

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks?page=1&isDone=true`)
        .respond(JSON.stringify(stageTasksDonePage1))

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks?page=2&isDone=true`)
        .respond(JSON.stringify(stageTasksDonePage2))
    })

    it('should get undone/done tasks', function* () {
      const signal = Task.getStageDoneTasks(stageId, {page: 1})
        .publish()
        .refCount()

      yield Task.getStageTasks(stageId)
        .take(1)
        .do(r => {
          forEach(r, (task, index) => {
            expectDeepEqual(task, stageTasksUndone[index])
          })
        })

      yield signal.take(1)

      yield Task.getStageDoneTasks(stageId, {page: 2})
        .take(1)
        .do(r => {
          forEach(r, (task, index) => {
            expectDeepEqual(task, stageTasksDonePage2[index])
          })
        })

      yield signal.take(1)
        .do(doneTasksPage1 => {
          forEach(doneTasksPage1, (task, index) => {
            if (index < 30) {
              expectDeepEqual(task, stageTasksDonePage1[index])
            } else {
              expectDeepEqual(task, stageTasksDonePage2[index - 30])
            }
          })
        })
    })

    it('should get undone/done tasks found in cache', function* () {
      const signal = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield signal.take(1)
        .do(r => {
          forEach(r, (task, index) => {
            expectDeepEqual(task, stageTasksUndone[index])
          })
          expect(spy.calledOnce).to.be.true
        })

      const signalDone1 = Task.getStageDoneTasks(stageId, {page: 1})
        .publish()
        .refCount()

      yield signalDone1.take(1)

      const signalDone2 = Task.getStageDoneTasks(stageId, {page: 2})
        .publish()
        .refCount()

      yield signalDone2.take(1)

      yield signalDone1.take(1)
        .do(r => {
          forEach(r, (task, index) => {
            if (index < 30) {
              expectDeepEqual(task, stageTasksDonePage1[index])
            } else {
              expectDeepEqual(task, stageTasksDonePage2[index - 30])
            }
          })
        })

      yield signalDone2.take(1)
        .do(r => {
          forEach(r, (task, index) => {
            expectDeepEqual(task, stageTasksDonePage2[index])
          })
          expect(spy.calledThrice).to.be.true
        })
    })

    it('should create new one then added to undone task list', function* () {
      const newTaskInfo = {
        _tasklistId: stageTasksUndone[0]._tasklistId,
        content: 'mocktaskcontent'
      }
      const now = new Date().toString()
      const newTask = {
        _id: 'mocktaskid',
        _projectId: stageTasksUndone[0]._projectId,
        _tasklistId: stageTasksUndone[0]._tasklistId,
        _stageId: stageId,
        content: 'mocktaskcontent',
        updated: now,
        created: now
      }

      httpBackend.whenPOST(`${apihost}tasks`, newTaskInfo)
        .respond(JSON.stringify(newTask))

      const signal = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.create(newTaskInfo)
        .do(r => {
          expectDeepEqual(newTask, r)
        })

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksUndone.length + 1)
          expectDeepEqual(newTask, r[0])
        })
    })

    it('should delete one from undone task list', function* () {
      const _taskId = stageTasksUndone[0]._id
      const nextTask = stageTasksUndone[1]

      httpBackend.whenDELETE(`${apihost}tasks/${_taskId}`)
        .respond({})

      const signal = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(_taskId)
        .do(r => {
          expect(r).to.be.null
        })

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksUndone.length - 1)
          expectDeepEqual(nextTask, r[0])
        })
    })

    it('should move one to the undone task list of another stage', function* () {
      const _taskId = stageTasksUndone[0]._id
      const _anotherStageId: any = 'mockstageid'

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/move`, {
          _stageId: _anotherStageId
        })
        .respond({
          _id: _taskId,
          _stageId: _anotherStageId,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}stages/${_anotherStageId}/tasks`)
        .respond(JSON.stringify([]))

      const signal1 = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      const signal2 = Task.getStageTasks(_anotherStageId)
        .publish()
        .refCount()

      yield signal1.take(1)

      yield signal2.take(1)

      yield Task.move(_taskId, {
          _stageId: _anotherStageId
        })
        .do(r => {
          expect(r._id).to.be.equal(_taskId)
        })

      yield signal1.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksUndone.length - 1)
        })

      yield signal2.take(1)
        .do(r => {
          expect(r.length).to.be.equal(1)
          expect(r[0]._id).to.be.equal(_taskId)
        })
    })

    it('should update task state to `true` then moved to done task list', function* () {
      const _taskId = stageTasksUndone[0]._id

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/isDone`, {
          isDone: true
        })
        .respond({
          _id: _taskId,
          isDone: true,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks?isDone=true`)
        .empty()
        .respond(JSON.stringify([]))

      const signal = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      const signalDone = Task.getStageDoneTasks(stageId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield signalDone.take(1)

      yield Task.updateStatus(_taskId, true)
        .do(r => {
          expect(r.isDone).to.be.true
        })

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksUndone.length - 1)
        })

      yield signalDone.take(1)
        .do(r => {
          expect(r.length).to.be.equal(1)
          expect(r[0]._id).to.be.equal(_taskId)
          expect(r[0].isDone).to.be.true
        })
    })

    it('should delete one from done task list', function* () {
      const _taskId = stageDoneTask._id
      const nextDoneTask = stageTasksDone[1]

      httpBackend.whenDELETE(`${apihost}tasks/${_taskId}`)
        .respond({})

      const signal = Task.getStageDoneTasks(stageId, {page: 1})
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.delete(_taskId)
        .do(r => {
          expect(r).to.be.null
        })

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksDonePage1.length - 1)
          expectDeepEqual(nextDoneTask, r[0])
        })
    })

    it('should move one to the done task list of another stage', function* () {
      const _taskId = stageDoneTask._id
      const _anotherStageId: any = 'mockstageid'

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/move`, {
          _stageId: _anotherStageId
        })
        .respond({
          _id: _taskId,
          _stageId: _anotherStageId,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}stages/${_anotherStageId}/tasks?isDone=true`)
        .respond(JSON.stringify([]))

      const signal1 = Task.getStageDoneTasks(stageId, {page: 1})
        .publish()
        .refCount()

      const signal2 = Task.getStageDoneTasks(_anotherStageId)
        .publish()
        .refCount()

      yield signal1.take(1)

      yield signal2.take(1)

      yield Task.move(_taskId, {
          _stageId: _anotherStageId
        })
        .do(r => {
          expect(r._id).to.be.equal(_taskId)
        })

      yield signal1.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksDonePage1.length - 1)
        })

      yield signal2.take(1)
        .do(r => {
          expect(r.length).to.be.equal(1)
          expect(r[0]._id).to.be.equal(_taskId)
        })
    })

    it('should update task state to `false` then moved to undone task list', function* () {
      const _taskId = stageDoneTask._id

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/isDone`, {
          isDone: false
        })
        .respond({
          _id: _taskId,
          isDone: false,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks`)
        .empty()
        .respond([])

      const signal1 = Task.getStageTasks(stageId)
        .publish()
        .refCount()

      const signal2 = Task.getStageDoneTasks(stageId, {page: 1})
        .publish()
        .refCount()

      yield signal1.take(1)

      yield signal2.take(1)

      yield Task.updateStatus(_taskId, false)
        .do(r => {
          expect(r.isDone).to.be.false
        })

      yield signal1.take(1)
        .do(r => {
          expect(r.length).to.be.equal(1)
          expect(r[0]._id).to.be.equal(_taskId)
          expect(r[0].isDone).to.be.false
        })

      yield signal2.take(1)
        .do(r => {
          expect(r.length).to.be.equal(stageTasksDonePage1.length - 1)
        })
    })
  })

  it('create task should ok', function* () {
    const mockTask = {
      content: 'create task test',
      _id: 'createtasktest',
      _tasklistId: '56988fb7644284a37be3ba6f',
      _creatorId: '56986d43542ce1a2798c8cfb',
      _executorId: '56986d43542ce1a2798c8cfb',
      _projectId: '56988fb705ead4ae7bb8dcfe'
    }

    httpBackend.whenPOST(`${apihost}tasks`, {
      content: 'create task test',
      _tasklistId: '56988fb7644284a37be3ba6f'
    }).respond(JSON.stringify(mockTask))

    yield Task.create(<any>{
      content: 'create task test',
      _tasklistId: '56988fb7644284a37be3ba6f'
    }).do(data => {
      expectDeepEqual(data, mockTask)
    })

  })

  describe('fork task: ', () => {

    const makeRandomNumber = () => {
      return Math.exp(Math.log(Date.now()) * Math.random())
    }

    it('fork task and get project tasks', function* () {

      // 原数据
      const task = projectTasks[0]
      const _taskId = task._id
      const _stageId = task._stageId
      const _projectId = task._projectId

      // 新复制数据
      const newTask = clone(task)
      newTask._id = makeRandomNumber().toString()

      httpBackend.whenGET(`${apihost}projects/${_projectId}/tasks`)
        .respond(JSON.stringify(projectTasks))

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/fork`, {
          _stageId
        })
        .respond(newTask)

      const signal = Task.getProjectTasks(_projectId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.fork(_taskId, {_stageId})

      yield signal.take(1)
        .do(r => {
          expect(r.map(task => task._id)).to.deep
            .equal([newTask].concat(projectTasks).map(task => task._id))
        })
    })

    it('fork task and get tasklist tasks', function* () {

      // 原数据
      const task = tasksUndone[0]
      const _taskId = task._id
      const _tasklistId = task._tasklistId

      // 新复制数据
      const newTask = clone(task)
      newTask._id = makeRandomNumber().toString()
      let _newTasklistId = null
      let _newStageId = null
      tasklists.some(tasklist => {
        if (tasklist._id !== _tasklistId &&
            tasklist.stageIds &&
            tasklist.stageIds.length) {
          newTask._projectId = tasklist._projectId
          newTask._tasklistId = _newTasklistId = tasklist._id
          newTask._stageId = _newStageId = tasklist.stageIds[0]
          return true
        }
      })

      httpBackend.whenGET(`${apihost}tasklists/${_newTasklistId}/tasks?isDone=false`)
        .respond(JSON.stringify([]))

      httpBackend.whenPUT(`${apihost}tasks/${_taskId}/fork`, {
          _stageId: _newStageId
        })
        .respond(newTask)

      const signal = Task.getTasklistUndone(_newTasklistId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.fork(_taskId, {_stageId: _newStageId})

      yield signal.take(1)
        .do(([r]) => {
          expectDeepEqual(r, newTask)
        })
    })
  })

  describe('update task: ', () => {
    const mockTaskGet = clone(tasksUndone[0])

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))
    })

    it('move task should ok', function* () {

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/move`, {
        _stageId: 'taskmoveteststage'
      }).respond({
        _projectId: 'taskmovetestproject',
        _stageId: 'taskmoveteststage',
        _tasklistId: 'taskmovetesttasklist'
      })

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.move(mockTaskGet._id, <any>{
        _stageId: 'taskmoveteststage'
      })

      yield signal.take(1)
        .do(data => {
          expect(data._stageId).to.equal('taskmoveteststage')
        })
    })

    it('update task content should ok', function* () {

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/content`, {
        content: 'taskcontenttest'
      }).respond({
        content: 'taskcontenttest'
      })

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateContent(mockTaskGet._id, 'taskcontenttest')

      yield signal.take(1)
        .do(data => {
          expect(data.content).to.equal('taskcontenttest')
        })
    })

    it('update task dueDate should ok', function* () {
      const dueDate = new Date().toISOString()
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: dueDate
      }).respond({
        dueDate: dueDate
      })

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateDueDate(mockTaskGet._id, dueDate)

      yield signal.take(1)
        .do(data => {
          expect(data.dueDate).to.equal(dueDate)
        })
    })

    it('update task dueDate error format should throw', function* () {
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: '123'
      }).error('dueDate must be ISOString', {
        status: 400,
        statusText: 'bad request'
      })

      yield Task.get(mockTaskGet._id).take(1)

      yield Task.updateDueDate(mockTaskGet._id, '123')
        .catch((err: Response) => {
          return err.text()
        })
        .do({
          next: r => {
            expect(r).to.equal('dueDate must be ISOString')
          }
        })

    })

    it('update executor should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        _executorId: 'test executor',
        executor: {
          _id: 'test executor',
          name: 'teambition sdk executor test',
          avatarUrl: 'xxxx'
        },
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/_executorId`, {
        _executorId: 'test executor'
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateExecutor(mockTaskGet._id, <any>'test executor')
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.executor).deep.equal({
            _id: 'test executor',
            name: 'teambition sdk executor test',
            avatarUrl: 'xxxx'
          })
        })
    })

    it('update same executor should ok', function* () {
      const _executorId = mockTaskGet._executorId

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/_executorId`, {
          _executorId
        })
        .respond('')

      let i = 1

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      signal.subscribe(() => {
        i++
      })

      yield Task.updateExecutor(mockTaskGet._id, _executorId)

      yield signal.take(1).do(() => {
        expect(i).to.equal(2)
      })

    })

    it('update involove members should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: ['a', 'b'],
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        involveMembers: ['a', 'b']
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateInvolvemembers(mockTaskGet._id, <any>['a', 'b'], 'involveMembers')
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.involveMembers).deep.equal(['a', 'b'])
        })
    })

    it('add involove members should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: mockTaskGet.involveMembers.concat(['a', 'b']),
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        addInvolvers: ['a', 'b']
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateInvolvemembers(mockTaskGet._id, <any>['a', 'b'], 'addInvolvers')
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.involveMembers).deep.equal(mockTaskGet.involveMembers.concat(['a', 'b']))
        })
    })

    it('add same involove members should ok', function* () {
      const involveMembers = mockTaskGet.involveMembers

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
          involveMembers
        })
        .respond('')

      let i = 1

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      signal.subscribe(() => {
        i++
      })

      yield Task.updateInvolvemembers(mockTaskGet._id, involveMembers, 'involveMembers')

      yield signal.take(1).do(() => expect(i).to.equal(2))
    })

    it('del involove members should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: [],
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        delInvolvers: ['56986d43542ce1a2798c8cfb']
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateInvolvemembers(mockTaskGet._id, <any>['56986d43542ce1a2798c8cfb'], 'delInvolvers')
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.involveMembers.length).to.equal(0)
        })
    })

    it('update note should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        note: '123',
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/note`, {
        note: '123'
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateNote(mockTaskGet._id, '123')
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.note).to.equal('123')
        })
    })

    it('update status should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        isDone: true,
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/isDone`, {
        isDone: true
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateStatus(mockTaskGet._id, true)
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.isDone).to.be.true
        })
    })

    it('update task use update api should ok', function* () {
      const mockResponse = {
        _id: mockTaskGet._id,
        priority: 2,
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}`, {
        priority: 2
      })
        .respond(JSON.stringify(mockResponse))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.update(mockTaskGet._id, {
        priority: 2
      })
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(task => {
          expect(task.priority).to.equal(2)
        })
    })

    it('archive task should ok', function* () {
      httpBackend.whenPOST(`${apihost}tasks/${mockTaskGet._id}/archive`)
        .respond(JSON.stringify({
          _id: mockTaskGet._id,
          isArchived: true
        }))

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.archive(mockTaskGet._id)

      yield signal.take(1)
        .do(r => {
          expect(r.isArchived).to.be.true
        })
    })

    it('unarchive task should ok', function* () {
      const _mock = clone(mockTaskGet)
      _mock.isArchived = true

      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(_mock))

      httpBackend.whenDELETE(`${apihost}tasks/${mockTaskGet._id}/archive?_stageId=${mockTaskGet._stageId}`)
        .respond(JSON.stringify({
          _id: mockTaskGet._id,
          isArchived: false
        }))
      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.unarchive(mockTaskGet._id, mockTaskGet._stageId)

      signal.take(1)
        .do(r => {
          expect(r.isArchived).to.be.false
        })
    })

    it('updateTags should ok', function* () {
      const tags: any = concat(mockTaskGet.tagIds, ['mocktag1', 'mocktag2'])
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/tagIds`, {
        tagIds: tags
      })
        .respond({
          _id: mockTaskGet._id,
          tagIds: tags
        })

      const signal = Task.get(mockTaskGet._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Task.updateTags(mockTaskGet._id, tags)

      yield signal.take(1)
        .do(r => {
          expect(r.tagIds).to.deep.equal(tags)
        })
    })

  })
})
