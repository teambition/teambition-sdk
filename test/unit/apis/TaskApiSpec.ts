'use strict'
import { Scheduler } from 'rxjs'
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
  BaseFetch
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

const expect = chai.expect
chai.use(sinonChai)

export default describe('Task API test', () => {
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

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=false`)
        .respond(JSON.stringify(tasksUndone))

      httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
        .respond(JSON.stringify(mockTask))

      httpBackend.whenGET(`${apihost}tasks/${mockTaskDone._id}`)
        .respond(JSON.stringify(mockTaskDone))
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
        .subscribe(null, err => {
          expect(err.message).to.equal('Unauthorize, statu code: 401')
          done()
        })

      httpBackend.flush()
    })

    it('get tasks done should ok', done => {
      const page1 = tasksDone.map((task, pos) => {
        if (pos < 30) {
          return task
        }
      }).filter(x => !!x)

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
            if (key !== 'isDone') {
              expect(ele).to.deep.equal(mockDoneTask[key])
            }else {
              expect(ele).to.equal(!mockDoneTask[key])
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

  })

})
