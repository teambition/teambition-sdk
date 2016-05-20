'use strict'
import {Scheduler} from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {
  apihost,
  TaskAPI,
  Backend,
  forEach,
  clone,
  OrganizationData,
  BaseAPI
} from '../index'
import {flush, expectDeepEqual, timeout, notInclude} from '../utils'
import {tasksDone} from '../mock/tasksDone'
import {tasksUndone} from '../mock/tasksUndone'
import {organizations} from '../mock/organizations'
import {organizationMyDueTasks} from '../mock/organizationMyDueTasks'
import {organizationMyTasks} from '../mock/organizationMyTasks'
import {organizationMyDoneTasks} from '../mock/organizationMyDoneTasks'

const expect = chai.expect
chai.use(sinonChai)

describe('Task API test', () => {
  let Task: TaskAPI
  let httpBackend: Backend

  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()
    spy = sinon.spy(BaseAPI.fetch, 'get')
    Task = new TaskAPI()
    httpBackend = new Backend()
  })

  afterEach(() => {
    BaseAPI.fetch.get['restore']()
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

    it('get tasks undone should ok', done => {
      Task.getTasklistsUndone(tasklistId)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
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

      timeout(Task.getTasklistDone(tasklistId, 2), 20)
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

      setTimeout(() => {
        Task.getTasklistDone(tasklistId, 1)
          .subscribe(data => {
            expect(data.length).to.equal(30)
            forEach(data, (task, index) => {
              expectDeepEqual(task, tasksDone[index])
            })
            expect(spy).to.be.calledOnce
            done()
          })
      }, 20)

      httpBackend.flush()
    })

    it('add task to task undone should ok', done => {
      const length = tasksUndone.length

      Task.getTasklistsUndone(tasklistId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(length + 1)
          expect(data[0]._id).to.equal('mocktaskundone')
          done()
        })

      timeout(Task.get('mocktaskundone'), 20)
        .subscribe()

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

      timeout(Task.get('mocktaskdone'), 20)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('get organization tasks: ', () => {
    const organization: OrganizationData = organizations[0]
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
    }).filter(x => !!x)

    const duepage2 = organizationMyDueTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
    }).filter(x => !!x)

    const taskspage1 = organizationMyTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
    }).filter(x => !!x)

    const taskspage2 = organizationMyTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
    }).filter(x => !!x)

    const tasksdonepage1 = organizationMyDoneTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
    }).filter(x => !!x)

    const tasksdonepage2 = organizationMyDoneTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
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
      Task.getOrganizationMyDueTasks(organization)
        .subscribe(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, duepage1[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get my dueDate tasks more page has should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(duepage2.length + 30)
          done()
        })

      timeout(Task.getOrganizationMyDueTasks(organization, 2), 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks has dueDate from cache should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .subscribe()

      setTimeout(() => {
        Task.getOrganizationMyDueTasks(organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, duepage1[index])
            })
            done()
          })
      }, 10)

      httpBackend.flush()
    })

    it('add my tasks has dueDate should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data[0]._id).to.equal('mocktaskdue')
          done()
        })

      timeout(Task.get(mockTaskDue._id), 10)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks has dueDate should ok', done => {
      const task = organizationMyDueTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrganizationMyDueTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks has no dueDate should ok', done => {
      Task.getOrganizationMyTasks(organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, taskspage1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get my tasks page 2 should ok', done => {
      Task.getOrganizationMyTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(taskspage2.length + 30)
          done()
        })

      timeout(Task.getOrganizationMyTasks(organization, 2), 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks from cache should ok', done => {

      Task.getOrganizationMyTasks(organization)
        .subscribe()

      setTimeout(() => {
        Task.getOrganizationMyTasks(organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, taskspage1[index])
            })
            expect(spy).to.have.calledOnce
            done()
          })
      }, 20)

      httpBackend.flush()
    })

    it('add my tasks no dueDate should ok', done => {
      Task.getOrganizationMyTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data[0]._id).to.equal('mocktasknodue')
          done()
        })

      timeout(Task.get(mockTaskNodue._id), 10)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks no dueDate should ok', done => {
      const task = organizationMyTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrganizationMyTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks done should ok', done => {
      Task.getOrganizationMyDoneTasks(organization)
        .subscribe(data => {
          forEach(data, (task, pos) => {
            expectDeepEqual(task, tasksdonepage1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get my tasks done more page should ok', done => {
      Task.getOrganizationMyDoneTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(tasksdonepage2.length + 30)
          done()
        })

      timeout(Task.getOrganizationMyDoneTasks(organization, 2), 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get my tasks done from cache should ok', done => {

      Task.getOrganizationMyDoneTasks(organization)
        .skip(1)
        .subscribe()

      setTimeout(() => {
        Task.getOrganizationMyDoneTasks(organization, 1)
          .subscribe(data => {
            forEach(data, (task, pos) => {
              expectDeepEqual(task, tasksdonepage1[pos])
            })
            expect(spy).to.have.calledOnce
            done()
          })
      }, 20)

      httpBackend.flush()
    })

    it('add my tasks done should ok', done => {
      Task.getOrganizationMyDoneTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(31)
          expectDeepEqual(data[0], mockTaskDone)
          done()
        })

      timeout(Task.get(mockTaskDone._id), 20)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task from my tasks done should ok', done => {
      const task = organizationMyDoneTasks[0]

      httpBackend.whenDELETE(`${apihost}tasks/${task._id}`)
        .respond({})

      Task.getOrganizationMyDoneTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(29)
          expect(notInclude(data, task))
          done()
        })

      Task.delete(task._id)
        .subscribeOn(Scheduler.async, 20)
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
        .subscribeOn(Scheduler.async, 20)
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
        .subscribeOn(Scheduler.async, 20)
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
        .subscribeOn(Scheduler.async, 20)
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
        .subscribeOn(Scheduler.async, 20)
        .subscribe(null, err => {
          expect(err.message).to.equal('dueDate must be ISOString, statu code: 400')
          done()
        })

      httpBackend.flush()
    })

  })

})
