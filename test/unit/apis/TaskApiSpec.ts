'use strict'
import * as chai from 'chai'
import {
  apihost,
  TaskAPI,
  Backend,
  forEach,
  clone,
  OrganizationData
} from '../index'
import {flush, expectDeepEqual, timeout} from '../utils'
import {tasksDone} from '../mock/tasksDone'
import {tasksUndone} from '../mock/tasksUndone'
import {organizations} from '../mock/organizations'
import {organizationMyDueTasks} from '../mock/organizationMyDueTasks'
import {organizationMyTasks} from '../mock/organizationMyTasks'

const expect = chai.expect

describe('Task API test', () => {
  let Task: TaskAPI
  let httpBackend: Backend

  const mockTask = clone(tasksUndone[0])
  mockTask._id = 'mocktaskundone'
  const mockTaskDone = clone(tasksDone[0])
  mockTaskDone._id = 'mocktaskdone'

  beforeEach(() => {
    flush()

    Task = new TaskAPI()
    httpBackend = new Backend()

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))

    httpBackend.whenGET(`${apihost}tasks/${mockTaskDone._id}`)
      .respond(JSON.stringify(mockTaskDone))
  })

  describe('get tasks by tasklist id: ', () => {
    const tasklistId = tasksDone[0]._tasklistId

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/tasks?isDone=false`)
        .respond(JSON.stringify(tasksUndone))
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

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(duepage1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(duepage2))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(taskspage1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(taskspage2))

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

    it('get more page has should ok', done => {
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
            done()
          })
      }, 10)

      httpBackend.flush()
    })
  })

})
