'use strict'
import * as chai from 'chai'
import {apihost, TaskAPI, Backend, forEach, OrganizationData} from '../index'
import {flush, expectDeepEqual, timeout} from '../utils'
import {tasksDone} from '../mock/tasksDone'
import {tasksUndone} from '../mock/tasksUndone'
import {organizations} from '../mock/organizations'
import {organizationMyDueTasks} from '../mock/organizationMyDueTasks'

const expect = chai.expect

describe('Task API test', () => {
  let Task: TaskAPI
  let httpBackend: Backend

  beforeEach(() => {
    flush()

    Task = new TaskAPI()
    httpBackend = new Backend()
  })

  describe('get tasks by tasklist id should ok', () => {
    let tasklistId = tasksDone[0]._tasklistId

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
  })

  describe('get organization tasks should ok', () => {
    const organization: OrganizationData = organizations[0]
    const organizationId = organization._id

    const page1 = organizationMyDueTasks.map((task, index) => {
      if (index < 30) {
        return task
      }
    }).filter(task => !!task)

    const page2 = organizationMyDueTasks.map((task, index) => {
      if (index >= 30 && index < 60) {
        return task
      }
    }).filter(task => !!task)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=1&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/tasks/me?page=2&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page2))

    })

    it('get my tasks has dueDate should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .subscribe(data => {
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get more page has should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page2.length + 30)
          done()
        })

      timeout(Task.getOrganizationMyDueTasks(organization, 2), 20)
        .subscribe()

      httpBackend.flush()
    })

    it('get tasks from cache should ok', done => {
      Task.getOrganizationMyDueTasks(organization)
        .subscribe()

      setTimeout(() => {
        Task.getOrganizationMyDueTasks(organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, page1[index])
            })
            done()
          })
      }, 10)

      httpBackend.flush()
    })
  })

})
