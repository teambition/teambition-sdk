'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {
  apihost,
  SubtaskAPI,
  Backend,
  forEach,
  clone,
  BaseAPI
} from '../index'
import { organizations } from '../../mock/organizations'
import { subtasks } from '../../mock/subtasks'
import { organizationMySubtasks } from '../../mock/organizationMySubtasks'
import { organizationMyDueSubtasks } from '../../mock/organizationMyDueSubtasks'
import { organizationMyDoneSubtasks } from '../../mock/organizationMyDoneSubtasks'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Subtask API test: ', () => {
  let Subtask: SubtaskAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  const organization = organizations[0]
  const organizationId = organization._id
  const userId = organizationMySubtasks[0]._executorId

  const subtaskId = 'mocksubtask'
  const subtask = clone(subtasks[0])

  subtask._id = subtaskId

  beforeEach(() => {
    flush()
    spy = sinon.spy(BaseAPI.fetch, 'get')
    Subtask = new SubtaskAPI()
    httpBackend = new Backend()

    httpBackend.whenGET(`${apihost}subtasks/${subtaskId}`)
      .respond(JSON.stringify(subtask))
  })

  afterEach(() => {
    BaseAPI.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get organization my subtasks without dueDate: ', () => {
    const page1 = organizationMySubtasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = organizationMySubtasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=false&hasDuedate=false`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrganizationMySubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, index) => {
            expectDeepEqual(task, page1[index])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Subtask.getOrganizationMySubtasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          done()
        })

      Subtask.getOrganizationMySubtasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Subtask.getOrganizationMySubtasks(userId, organization)
        .subscribe()

      setTimeout(() => {
        Subtask.getOrganizationMySubtasks(userId, organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, page1[index])
            })
            expect(spy).to.be.calledOnce
            done()
          })
      }, global.timeout1)

      httpBackend.flush()
    })
  })

  describe('get organization my subtasks have dueDate: ', () => {
    const page1 = organizationMyDueSubtasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = organizationMyDueSubtasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=false&hasDuedate=true`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrganizationMyDueSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Subtask.getOrganizationMyDueSubtasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          done()
        })

      Subtask.getOrganizationMyDueSubtasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Subtask.getOrganizationMyDueSubtasks(userId, organization)
        .subscribe()

      setTimeout(() => {
        Subtask.getOrganizationMyDueSubtasks(userId, organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, page1[index])
            })
            expect(spy).to.be.calledOnce
            done()
          })
      }, global.timeout1)

      httpBackend.flush()
    })
  })

  describe('get organization my subtasks done: ', () => {
    const page1 = organizationMyDoneSubtasks.map((task, pos) => {
      if (pos < 30) {
        return task
      }
    }).filter(x => !!x)

    const page2 = organizationMyDoneSubtasks.map((task, pos) => {
      if (pos >= 30 && pos < 60) {
        return task
      }
    }).filter(x => !!x)

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=1&isDone=true`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}organizations/${organizationId}/subtasks/me?page=2&isDone=true`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      Subtask.getOrganizationMyDoneSubtasks(userId, organization)
        .subscribe(data => {
          expect(data).to.be.instanceof(Array)
          forEach(data, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      Subtask.getOrganizationMyDoneSubtasks(userId, organization)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(page1.length + page2.length)
          done()
        })

      Subtask.getOrganizationMyDoneSubtasks(userId, organization, 2)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      Subtask.getOrganizationMyDoneSubtasks(userId, organization)
        .subscribe()

      setTimeout(() => {
        Subtask.getOrganizationMyDoneSubtasks(userId, organization, 1)
          .subscribe(data => {
            forEach(data, (task, index) => {
              expectDeepEqual(task, page1[index])
            })
            expect(spy).to.be.calledOnce
            done()
          })
      }, global.timeout2)

      httpBackend.flush()
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

    httpBackend.flush()
  })

  it('add to subtask to task should ok', done => {
    const taskId = subtasks[0]._taskId

    Subtask.getFromTask(taskId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(subtasks.length + 1)
        expectDeepEqual(data[0], subtask)
        done()
      })

    Subtask.get(subtaskId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('get task should ok', done => {
    Subtask.get(subtaskId)
      .subscribe(data => {
        expectDeepEqual(data, subtask)
        done()
      })

    httpBackend.flush()
  })

  it('create subtask should ok', done => {
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

    Subtask.create(createSubtaskData)
      .subscribe(data => {
        expectDeepEqual(data, result)
        done()
      })

    httpBackend.flush()
  })

  it('delete subtask should ok', done => {
    httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
      .respond({})

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe(data => {
        expect(data).to.be.undefined
        done()
      })

    Subtask.delete(subtaskId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update subtask should ok', done => {
    const dueDate = new Date().toISOString()
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}`, {
      content: 'test',
      dueDate: dueDate
    }).respond({
      content: 'test',
      dueDate: dueDate
    })

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe(data => {
        expect(data.content).to.equal('test')
        expect(data.dueDate).to.equal(dueDate)
        done()
      })

    Subtask.update(subtaskId, {
      content: 'test',
      dueDate: dueDate
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('transform subtask should ok', done => {
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/transform`, {
      doLink: false,
      doLinked: false
    })
      .respond({
        _id: subtaskId,
        _projectId: subtask._projectId,
        _tasklistId: 'aaa',
        _stageId: 'xxx',
        content: subtask.content
      })

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe(data => {
        expect(data).to.be.undefined
        done()
      })

    Subtask.transform(subtaskId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update content should ok', done => {
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/content`, {
      content: 'update content test'
    }).respond({
      content: 'update content test'
    })

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe(data => {
        expect(data.content).to.equal('update content test')
        done()
      })

    Subtask.updateContent(subtaskId, 'update content test')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update dueDate should ok', done => {
    const dueDate = new Date().toISOString()
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/dueDate`, {
      dueDate: dueDate
    }).respond({
      dueDate: dueDate
    })

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe(data => {
        expect(data.dueDate).to.equal(dueDate)
        done()
      })

    Subtask.updateDuedate(subtaskId, dueDate)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update error format dueDate should be caught', done => {
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/dueDate`, {
      dueDate: 'xxx'
    }).error('dueDate must be ISOString', 400)

    Subtask.get(subtaskId)
      .skip(1)
      .subscribe()

    Subtask.updateDuedate(subtaskId, 'xxx')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(null, err => {
        expect(err.message).to.equal('dueDate must be ISOString, statu code: 400')
        done()
      })

    httpBackend.flush()
  })

  it('update subtask statu should ok', done => {
    httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
      isDone: true
    })
      .respond({
        isDone: true
      })

    const get = Subtask.get(subtaskId)

    get.subscribe()

    Subtask.updateStatus(subtaskId, true)
      .subscribeOn(Scheduler.async, global.timeout1)
      .concatMap(x => Subtask.get(subtaskId))
      .subscribe(data => {
        expect(data.isDone).to.be.true
        done()
      })

    httpBackend.flush()
  })

})