'use strict'
import { Scheduler, Observable } from 'rxjs'
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

      httpBackend.flush()
    })

    it('network error should be handed', done => {
      httpBackend.whenGET(`${apihost}tasklists/error/tasks?isDone=false`)
        .error('Unauthorize', 401)

      Task.getTasklistUndone('error')
        .subscribe({
          error: (err: Error) => {
            expect(err.message).to.equal('Unauthorize, statu code: 401')
            done()
          }
        })

      httpBackend.flush()
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

      httpBackend.flush()
    })

    it('get tasks done next page should ok', done => {
      const page1 = tasksDone.map((task, pos) => {
        if (pos < 30) {
          return task
        }
      }).filter(x => !!x)

      const page2 = tasksDone.map((task, pos) => {
        if (pos >= 30) {
          return task
        }
      }).filter(x => !!x)

      const length = page2.length

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=2&limit=30`)
        .respond(JSON.stringify(page2))

      Task.getTasklistDone(tasklistId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(length + 30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
        })

      Task.getTasklistDone(tasklistId, 2)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          expect(data.length).to.equal(length)
          done()
        })

      httpBackend.flush()
    })

    it('get tasks done from cache should ok', done => {
      const page1 = tasksDone.map((task, pos) => {
        if (pos < 30) {
          return task
        }
      }).filter(x => !!x)

      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=true&page=1&limit=30`)
        .respond(JSON.stringify(page1))

      Task.getTasklistDone(tasklistId)
        .subscribe()

      Task.getTasklistDone(tasklistId)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          expect(data.length).to.equal(30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get tasks concurrency should ok', done => {

      Task.getTasklistDone(tasklistId)
        .subscribe()

      Task.getTasklistDone(tasklistId)
        .subscribe()

      Task.getTasklistDone(tasklistId)
        .subscribe()

      Task.getTasklistDone(tasklistId)
        .subscribe()

      Task.getTasklistDone(tasklistId)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          expect(data.length).to.equal(30)
          forEach(data, (task, index) => {
            expectDeepEqual(task, tasksDone[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('add task to task undone should ok', done => {
      const length = tasksUndone.length

      Task.getTasklistUndone(tasklistId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(length + 1)
          expect(data[0]._id).to.equal('mocktaskundone')
          done()
        })

      Task.get('mocktaskundone')
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('undone task should ok', done => {
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

      Task.getTasklistUndone(tasklistId)
        .skip(1)
        .subscribe(tasks => {
          expect(tasks.length).to.equal(length + 1)
          forEach(tasks[0], (ele, key) => {
            if (key !== '_requested') {
              if (key !== 'isDone') {
                expect(ele).to.deep.equal(mockDoneTask[key])
              }else {
                expect(ele).to.equal(!mockDoneTask[key])
              }
            }
          })
        })

      Task.get(mockDoneTask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      Task.updateStatus(mockDoneTask._id, false)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('add task to task done should ok', done => {

      Task.getTasklistDone(tasklistId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(31)
          expect(data[0]._id).to.equal('mocktaskdone')
          done()
        })

      Task.get('mocktaskdone')
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
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

    const duepage1 = organizationMyDueTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
      return
    }).filter(x => !!x)

    const duepage2 = organizationMyDueTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
      return
    }).filter(x => !!x)

    const taskspage1 = organizationMyTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
      return
    }).filter(x => !!x)

    const taskspage2 = organizationMyTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
      return
    }).filter(x => !!x)

    const tasksdonepage1 = organizationMyDoneTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
      return
    }).filter(x => !!x)

    const tasksdonepage2 = organizationMyDoneTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
      return
    }).filter(x => !!x)

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

      httpBackend.flush()
    })

    it('get my dueDate tasks more page has should ok', done => {
      Task.getOrgMyDueTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(duepage2.length + 30)
          done()
        })

      Task.getOrgMyDueTasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks has dueDate from cache should ok', done => {
      Task.getOrgMyDueTasks(userId, organization)
        .subscribe()

      Task.getOrgMyDueTasks(userId, organization, 1)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, duepage1[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('add my tasks has dueDate should ok', done => {
      Task.getOrgMyDueTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data[0]._id).to.equal('mocktaskdue')
          done()
        })

      Task.get(mockTaskDue._id)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks has dueDate should ok', done => {
      const task = organizationMyDueTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrgMyDueTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('done task from my tasks has dueDate should ok', done => {
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

      Task.getOrgMyDueTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
        })

      Task.updateStatus(task._id, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('get my tasks has no dueDate should ok', done => {
      Task.getOrgMyTasks(userId, organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, taskspage1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get my tasks page 2 should ok', done => {
      Task.getOrgMyTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(taskspage2.length + 30)
          done()
        })

      Task.getOrgMyTasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout4)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks from cache should ok', done => {

      Task.getOrgMyTasks(userId, organization)
        .subscribe()

      Task.getOrgMyTasks(userId, organization, 1)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, taskspage1[index])
          })
          expect(spy).to.have.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('add my tasks no dueDate should ok', done => {
      Task.getOrgMyTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data[0]._id).to.equal('mocktasknodue')
          done()
        })

      Task.get(mockTaskNodue._id)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks no dueDate should ok', done => {
      const task = organizationMyTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrgMyTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('done task from my tasks no dueDate should ok', done => {
      const task = organizationMyTasks[0]

      httpBackend.whenPUT(`${apihost}tasks/${task._id}/isDone`, {
        isDone: true
      })
        .respond({
          _id: task._id,
          isDone: true,
          updated: Date.now()
        })

      Task.getOrgMyTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.updateStatus(task._id, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks done should ok', done => {
      Task.getOrgMyDoneTasks(userId, organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksdonepage1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get my tasks done more page should ok', done => {
      Task.getOrgMyDoneTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksdonepage2.length + 30)
          done()
        })

      Task.getOrgMyDoneTasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks done from cache should ok', done => {

      Task.getOrgMyDoneTasks(userId, organization)
        .skip(1)
        .subscribe()

      Task.getOrgMyDoneTasks(userId, organization, 1)
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksdonepage1[pos])
          })
          expect(spy).to.have.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('add my tasks done should ok', done => {
      Task.getOrgMyDoneTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(31)
          expectDeepEqual(data[0], mockTaskDone)
          done()
        })

      Task.get(mockTaskDone._id)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks done should ok', done => {
      const task = organizationMyDoneTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrgMyDoneTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
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

      httpBackend.flush()
    })

    it('update task dueDate should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: null
      }).respond({
        dueDate: null
      })

      Task.getMyDueTasks(_userId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          done()
        })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          expect(data.dueDate).to.equal(null)
        })

      Task.updateDueDate(mockTaskGet._id, null)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      const task = tasksOneDayMe[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getMyDueTasks(userId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
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

      httpBackend.flush()
    })

    it('update task dueDate should ok', done => {
      const dueDate = new Date().toISOString()
      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: dueDate
      }).respond({
        dueDate: dueDate
      })

      Task.getMyTasks(_userId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          done()
        })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          expect(data.dueDate).to.equal(dueDate)
        })

      Task.updateDueDate(mockTaskGet._id, dueDate)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      const task = tasksOneDayMe[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getMyTasks(userId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('get organization created tasks: ', () => {
    const organization: OrganizationSchema = organizations[0]
    const organizationId = organization._id

    const page1 = organizationMyCreatedTasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = organizationMyCreatedTasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

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

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Task.getOrgMyCreatedTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          done()
        })

      Task.getOrgMyCreatedTasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Task.getOrgMyCreatedTasks(userId, organization)
        .subscribe()

      Task.getOrgMyCreatedTasks(userId, organization, 1)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get empty array when no data', done => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/created?page=1`)
        .empty()
        .respond([])

      Task.getOrgMyCreatedTasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.deep.equal([])
          done()
        })

      httpBackend.flush()
    })

    it('add task should ok', done => {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockcreatedtasktest'

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      Task.getOrgMyCreatedTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
          done()
        })

      Task.get(mockGet._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete should ok', done => {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      Task.getOrgMyCreatedTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
          done()
        })

      Task.delete(mockId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('get project tasks: ', () => {
    const project = projects[0]
    const projectId = project._id

    const page1 = projectTasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = projectTasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

    const donePage1 = projectDoneTasks.map((task, pos) => {
      if (pos < 20) {
        return task
      }
    }).filter(x => !!x)

    const donePage2 = projectDoneTasks.map((task, pos) => {
      if (pos >= 20 && pos < 50) {
        return task
      }
    }).filter(x => !!x)

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

    it('get should ok', done => {
      Task.getProjectTasks(projectId, {
        page: 1
      })
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
            expect(task.isDone).to.equal(false)
          })
          done()
        })

      httpBackend.flush()
    })

    it('get done tasks should ok', done => {
      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, donePage1[pos])
            expect(task.isDone).to.equal(true)
          })
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Task.getProjectTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          forEach(data, (task, pos) => {
            expect(task.isDone).to.equal(false)
          })
          done()
        })

      Task.getProjectTasks(projectId, {
        page: 2
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get done page2 should ok', done => {
      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(donePage1.length + donePage2.length)
          forEach(data, (task, pos) => {
            expect(task.isDone).to.equal(true)
          })
          done()
        })

      Task.getProjectDoneTasks(projectId, {
        page: 2
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Task.getProjectTasks(projectId, {
        page: 1
      })
        .subscribe()

      Task.getProjectTasks(projectId, {
        page: 1
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get done tasks from cache should ok', done => {
      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .subscribe()

      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          expect(spy).to.be.calledOnce
          forEach(data, (task, pos) => {
            expectDeepEqual(task, donePage1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('add task should ok', done => {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockcreatedtasktest'
      mockGet._projectId = projectId

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      Task.getProjectTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
          done()
        })

      Task.get(mockGet._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('add done task should ok', done => {
      const mockGet = clone(donePage1[0])
      mockGet._id = 'mockcreateddonetasktest'
      mockGet._projectId = projectId

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(donePage1.length + 1)
          expectDeepEqual(data[0], mockGet)
          done()
        })

      Task.get(mockGet._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete should ok', done => {
      const mockId = page1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      Task.getProjectTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
          done()
        })

      Task.delete(mockId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete done task should ok', done => {
      const mockId = donePage1[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${mockId}`)
        .respond({})

      Task.getProjectDoneTasks(projectId, {
        page: 1
      })
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(donePage1.length - 1)
          expect(notInclude(data, donePage1[0])).to.be.true
          done()
        })

      Task.delete(mockId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('get organization involves tasks: ', () => {
    const organization: OrganizationSchema = organizations[0]
    const organizationId = organization._id

    const page1 = organizationMyInvolvesTasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = organizationMyInvolvesTasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

    const maxId = page1[page1.length - 1]._id

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/involves?page=1`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me/involves?page=2&maxId=${maxId}`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Task.getOrgMyInvolvesTasks(userId, organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Task.getOrgMyInvolvesTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          done()
        })

      Task.getOrgMyInvolvesTasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Task.getOrgMyInvolvesTasks(userId, organization)
        .subscribe()

      Task.getOrgMyInvolvesTasks(userId, organization, 1)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('add a task should ok', done => {
      const mockGet = clone(page1[0])
      mockGet._id = 'mockinvolvestasks'

      httpBackend.whenGET(`${apihost}tasks/${mockGet._id}`)
        .respond(JSON.stringify(mockGet))

      Task.getOrgMyInvolvesTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + 1)
          expectDeepEqual(data[0], mockGet)
          done()
        })

      Task.get(mockGet._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete a task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${page1[0]._id}`)
        .respond({})

      Task.getOrgMyInvolvesTasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length - 1)
          expect(notInclude(data, page1[0])).to.be.true
          done()
        })

      Task.delete(page1[0]._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('stage tasks: ', () => {

    const stageId = stageTasksUndone[0]._stageId
    const stageDoneTask = stageTasksDone[0]
    const stageTasksDonePage1 = stageTasksDone.filter((task, index) => index < 30)
    const stageTasksDonePage2 = stageTasksDone.filter((task, index) => index >= 30 && index < 60)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks`)
        .respond(JSON.stringify(stageTasksUndone))

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks?page=1&isDone=true`)
        .respond(JSON.stringify(stageTasksDonePage1))

      httpBackend.whenGET(`${apihost}stages/${stageId}/tasks?page=2&isDone=true`)
        .respond(JSON.stringify(stageTasksDonePage2))

      httpBackend.flush()
    })

    it('should get undone/done tasks', done => {
      Observable.combineLatest(
          Task.getStageTasks(stageId),
          Task.getStageDoneTasks(stageId, {page: 1})
            .skip(1),
          Task.getStageDoneTasks(stageId, {page: 2})
            .subscribeOn(Scheduler.async, global.timeout2)
        )
        .subscribe(([tasks, doneTasksPage1, doneTasksPage2]) => {
          forEach(tasks, (task, index) => {
            expectDeepEqual(task, stageTasksUndone[index])
          })
          forEach(doneTasksPage1, (task, index) => {
            if (index < 30) {
              expectDeepEqual(task, stageTasksDonePage1[index])
            } else {
              expectDeepEqual(task, doneTasksPage2[index - 30])
            }
          })
          forEach(doneTasksPage2, (task, index) => {
            expectDeepEqual(task, stageTasksDonePage2[index])
          })
          done()
        })
    })

    it('should get undone/done tasks found in cache', done => {
      Observable.combineLatest(
          Task.getStageTasks(stageId),
          Task.getStageDoneTasks(stageId, {page: 1})
            .skip(1),
          Task.getStageDoneTasks(stageId, {page: 2})
            .subscribeOn(Scheduler.async, global.timeout1),
          Task.getStageTasks(stageId)
            .subscribeOn(Scheduler.async, global.timeout2),
          Task.getStageDoneTasks(stageId, {page: 1})
            .subscribeOn(Scheduler.async, global.timeout3),
          Task.getStageDoneTasks(stageId, {page: 2})
            .subscribeOn(Scheduler.async, global.timeout4)
        )
        .subscribe(([
          tasks,
          doneTasksPage1,
          doneTasksPage2,
          tasksCached,
          doneTasksPage1Cached,
          doneTasksPage2Cached
        ]) => {
          forEach(tasks, (task, index) => {
            expectDeepEqual(task, stageTasksUndone[index])
          })
          forEach(doneTasksPage1, (task, index) => {
            if (index < 30) {
              expectDeepEqual(task, stageTasksDonePage1[index])
            } else {
              expectDeepEqual(task, doneTasksPage2[index - 30])
            }
          })
          forEach(doneTasksPage2, (task, index) => {
            expectDeepEqual(task, stageTasksDonePage2[index])
          })
          forEach(tasksCached, (task, index) => {
            expectDeepEqual(task, stageTasksUndone[index])
          })
          forEach(stageTasksDonePage1, (task, index) => {
            expectDeepEqual(task, doneTasksPage1Cached[index])
          })
          forEach(doneTasksPage2Cached, (task, index) => {
            expectDeepEqual(task, stageTasksDonePage2[index])
          })
          expect(spy.calledThrice).to.be.true
          done()
        })
    })

    it('should create new one then added to undone task list', done => {
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

      Observable.combineLatest(
          Task.getStageTasks(stageId).skip(1),
          Task.create(newTaskInfo).subscribeOn(Scheduler.async, global.timeout1)
        )
        .subscribe(([tasks, anotherNewTask]) => {
          expect(tasks.length).to.be.equal(stageTasksUndone.length + 1)
          expectDeepEqual(newTask, tasks[0])
          expectDeepEqual(newTask, anotherNewTask)
          done()
        })
    })

    it('should delete one from undone task list', done => {
      const _taskId = stageTasksUndone[0]._id
      const nextTask = stageTasksUndone[1]

      httpBackend.whenDELETE(`${apihost}tasks/${_taskId}`)
        .respond({})

      Observable.combineLatest(
          Task.getStageTasks(stageId).skip(1),
          Task.delete(_taskId)
            .subscribeOn(Scheduler.async, global.timeout1)
        )
        .subscribe(([tasks, oldTask]) => {
          expect(tasks.length).to.be.equal(stageTasksUndone.length - 1)
          expectDeepEqual(nextTask, tasks[0])
          expect(oldTask).to.be.null
          done()
        })
    })

    it('should move one to the undone task list of another stage', done => {
      const _taskId = stageTasksUndone[0]._id
      const _anotherStageId = 'mockstageid'

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

      Observable.combineLatest(
          Task.getStageTasks(stageId).skip(1),
          Task.getStageTasks(_anotherStageId).skip(1),
          Task.move(_taskId, {
              _stageId: _anotherStageId
            })
            .subscribeOn(Scheduler.async, global.timeout4)
        )
        .subscribe(([tasks, anotherTasks, task]) => {
          expect(tasks.length).to.be.equal(stageTasksUndone.length - 1)
          expect(anotherTasks.length).to.be.equal(1)
          expect(anotherTasks[0]._id).to.be.equal(task._id)
          done()
        })
    })

    it('should update task state to `true` then moved to done task list', done => {
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

      Observable.combineLatest(
          Task.getStageTasks(stageId).skip(1),
          Task.getStageDoneTasks(stageId).skip(1),
          Task.updateStatus(_taskId, true)
            .subscribeOn(Scheduler.async, global.timeout4)
        )
        .subscribe(([tasks, doneTasks, newPatch]) => {
          expect(tasks.length).to.be.equal(stageTasksUndone.length - 1)
          expect(doneTasks.length).to.be.equal(1)
          expect(doneTasks[0]._id).to.be.equal(newPatch._id)
          expect(doneTasks[0].isDone).to.be
            .equal(newPatch.isDone)
            .and.be.true
          done()
        })
      httpBackend.flush()
    })

    it('should delete one from done task list', done => {
      const _taskId = stageDoneTask._id
      const nextDoneTask = stageTasksDone[1]

      httpBackend.whenDELETE(`${apihost}tasks/${_taskId}`)
        .respond({})

      Observable.combineLatest(
          Task.getStageDoneTasks(stageId, {page: 1})
            .skip(1),
          Task.delete(_taskId)
            .subscribeOn(Scheduler.async, global.timeout1)
        )
        .subscribe(([tasks, oldTask]) => {
          expect(tasks.length).to.be.equal(stageTasksDonePage1.length - 1)
          expectDeepEqual(nextDoneTask, tasks[0])
          expect(oldTask).to.be.null
          done()
        })
    })

    it('should move one to the done task list of another stage', done => {
      const _taskId = stageDoneTask._id
      const _anotherStageId = 'mockstageid'

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

      Observable.combineLatest(
          Task.getStageDoneTasks(stageId, {page: 1})
            .skip(1),
          Task.getStageDoneTasks(_anotherStageId)
            .skip(1),
          Task.move(_taskId, {
              _stageId: _anotherStageId
            })
            .subscribeOn(Scheduler.async, global.timeout4)
        )
        .subscribe(([tasks, anotherTasks, task]) => {
          expect(tasks.length).to.be.equal(stageTasksDonePage1.length - 1)
          expect(anotherTasks.length).to.be.equal(1)
          expect(anotherTasks[0]._id).to.be.equal(task._id)
          done()
        })
    })

    it('should update task state to `false` then moved to undone task list', done => {
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

      Observable.combineLatest(
          Task.getStageTasks(stageId)
            .skip(1),
          Task.getStageDoneTasks(stageId, {page: 1})
            .skip(1),
          Task.updateStatus(_taskId, false)
            .subscribeOn(Scheduler.async, global.timeout4)
        )
        .subscribe(([tasks, doneTasks, newPatch]) => {
          expect(tasks.length).to.be.equal(1)
          expect(doneTasks.length).to.be.equal(stageTasksDonePage1.length - 1)
          expect(tasks[0]._id).to.be.equal(newPatch._id)
          expect(tasks[0].isDone).to.be
            .equal(newPatch.isDone)
            .and.be.false
          done()
        })
      httpBackend.flush()
    })
  })

  it('create task should ok', done => {
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

    Task.create({
      content: 'create task test',
      _tasklistId: '56988fb7644284a37be3ba6f'
    }).subscribe(data => {
      expectDeepEqual(data, mockTask)
      done()
    })

    httpBackend.flush()
  })

  describe('fork task: ', () => {

    const makeRandomNumber = () => {
      return Math.exp(Math.log(Date.now()) * Math.random())
    }

    beforeEach(() => {
      httpBackend.flush()
    })

    it('fork task and get project tasks', done => {

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

      Observable.combineLatest(
          Task.getProjectTasks(_projectId).skip(1),
          Task.fork(_taskId, {_stageId})
            .subscribeOn(Scheduler.async, global.timeout1)
        )
        .subscribe(([tasks]) => {
          expect(tasks.map(task => task._id)).to.deep
            .equal([newTask].concat(projectTasks).map(task => task._id))
          done()
        })
    })

    it('fork task and get tasklist tasks', done => {

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

      Observable.combineLatest(
          Task.getTasklistUndone(_newTasklistId).skip(1),
          Task.fork(_taskId, {_stageId: _newStageId})
            .subscribeOn(Scheduler.async, global.timeout1)
        )
        .subscribe(([tasks]) => {
          expect(tasks).to.deep.equal([newTask])
          done()
        })
    })
  })

  describe('update task: ', () => {
    const mockTaskGet = clone(tasksUndone[0])

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(mockTaskGet))
    })

    it('move task should ok', done => {

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/move`, {
        _stageId: 'taskmoveteststage'
      }).respond({
        _projectId: 'taskmovetestproject',
        _stageId: 'taskmoveteststage',
        _tasklistId: 'taskmovetesttasklist'
      })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(data => {
          expect(data._stageId).to.equal('taskmoveteststage')
          done()
        })

      Task.move(mockTaskGet._id, {
        _stageId: 'taskmoveteststage'
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('update task content should ok', done => {

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/content`, {
        content: 'taskcontenttest'
      }).respond({
        content: 'taskcontenttest'
      })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(data => {
          expect(data.content).to.equal('taskcontenttest')
          done()
        })

      Task.updateContent(mockTaskGet._id, 'taskcontenttest')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('update task dueDate should ok', done => {
      const dueDate = new Date().toISOString()
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: dueDate
      }).respond({
        dueDate: dueDate
      })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(data => {
          expect(data.dueDate).to.equal(dueDate)
          done()
        })

      Task.updateDueDate(mockTaskGet._id, dueDate)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('update task dueDate error format should throw', done => {
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/dueDate`, {
        dueDate: '123'
      }).error('dueDate must be ISOString', 400)

      Task.get(mockTaskGet._id)
        .subscribe()

      Task.updateDueDate(mockTaskGet._id, '123')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(null, err => {
          expect(err.message).to.equal('dueDate must be ISOString, statu code: 400')
          done()
        })

      httpBackend.flush()
    })

    it('update executor should ok', done => {
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

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.executor).deep.equal({
            _id: 'test executor',
            name: 'teambition sdk executor test',
            avatarUrl: 'xxxx'
          })
        })

      Task.updateExecutor(mockTaskGet._id, 'test executor')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('update same executor should ok', done => {
      const _executorId = mockTaskGet._executorId

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/_executorId`, {
          _executorId
        })
        .respond('')

      let i = 1

      Task.get(mockTaskGet._id)
        .subscribe(() => {
          expect(i++).to.equal(1)
        })

      Task.updateExecutor(mockTaskGet._id, _executorId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          done()
        })

      httpBackend.flush()
    })

    it('update involove members should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: ['a', 'b'],
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        involveMembers: ['a', 'b']
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.involveMembers).deep.equal(['a', 'b'])
        })

      Task.updateInvolvemembers(mockTaskGet._id, ['a', 'b'], 'involveMembers')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('add involove members should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: mockTaskGet.involveMembers.concat(['a', 'b']),
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        addInvolvers: ['a', 'b']
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.involveMembers).deep.equal(mockTaskGet.involveMembers.concat(['a', 'b']))
        })

      Task.updateInvolvemembers(mockTaskGet._id, ['a', 'b'], 'addInvolvers')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('add same involove members should ok', done => {
      const involveMembers = mockTaskGet.involveMembers

      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
          involveMembers
        })
        .respond('')

      let i = 1

      Task.get(mockTaskGet._id)
        .subscribe(r => {
          expect(i).to.equal(1)
          i++
        }, err => console.error(err))

      Task.updateInvolvemembers(mockTaskGet._id, involveMembers, 'involveMembers')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('del involove members should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        involveMembers: [],
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/involveMembers`, {
        delInvolvers: ['56986d43542ce1a2798c8cfb']
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.involveMembers.length).to.equal(0)
        })

      Task.updateInvolvemembers(mockTaskGet._id, ['56986d43542ce1a2798c8cfb'], 'delInvolvers')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('update note should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        note: '123',
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/note`, {
        note: '123'
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.note).to.equal('123')
        })

      Task.updateNote(mockTaskGet._id, '123')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('update status should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        isDone: true,
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/isDone`, {
        isDone: true
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.isDone).to.be.true
        })

      Task.updateStatus(mockTaskGet._id, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('update task use update api should ok', done => {
      const mockResponse = {
        _id: mockTaskGet._id,
        priority: 2,
        updated: new Date().toISOString()
      }
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}`, {
        priority: 2
      })
        .respond(JSON.stringify(mockResponse))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(task => {
          expect(task.priority).to.equal(2)
        })

      Task.update(mockTaskGet._id, {
        priority: 2
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          expect(r).to.deep.equal(mockResponse)
          done()
        })

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${mockTaskGet._id}/archive`)
        .respond(JSON.stringify({
          _id: mockTaskGet._id,
          isArchived: true
        }))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(r => {
          expect(r.isArchived).to.be.true
          done()
        })

      Task.archive(mockTaskGet._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('unarchive task should ok', done => {
      const _mock = clone(mockTaskGet)
      _mock.isArchived = true

      httpBackend.whenGET(`${apihost}tasks/${mockTaskGet._id}`)
        .respond(JSON.stringify(_mock))

      httpBackend.whenDELETE(`${apihost}tasks/${mockTaskGet._id}/archive?_stageId=${mockTaskGet._stageId}`)
        .respond(JSON.stringify({
          _id: mockTaskGet._id,
          isArchived: false
        }))

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(r => {
          expect(r.isArchived).to.be.false
          done()
        })

      Task.unarchive(mockTaskGet._id, mockTaskGet._stageId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('updateTags should ok', done => {
      const tags = concat(mockTaskGet.tagIds, ['mocktag1', 'mocktag2'])
      httpBackend.whenPUT(`${apihost}tasks/${mockTaskGet._id}/tagIds`, {
        tagIds: tags
      })
        .respond({
          _id: mockTaskGet._id,
          tagIds: tags
        })

      Task.get(mockTaskGet._id)
        .skip(1)
        .subscribe(r => {
          expect(r.tagIds).to.deep.equal(tags)
          done()
        })

      Task.updateTags(mockTaskGet._id, tags)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })
})
