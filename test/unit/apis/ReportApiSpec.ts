'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import {
  Backend,
  apihost,
  ReportAPI,
  TaskAPI,
  SubtaskAPI,
  BaseFetch,
  forEach,
  clone
} from '../index'
import {
  thisweekAccomplishedTasks,
  thisweekAccomplishedSubtasks,
  beforeThisweekAccomplishedTasks,
  beforeThisweekAccomplishedSubtasks,
  accomplishedDelayTasks,
  accomplishedDelaySubtasks,
  accomplishedOntimeTasks,
  accomplishedOntimeSubtasks,
  inprogressDelayTasks,
  inprogressSubtasks,
  inprogressOntimeTasks,
  inprogressAllTasks,
  notStartTasks,
  unassignTasks
} from '../../mock/reportTasks'
import { flush, expectDeepEqual, notInclude } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('Report API Test: ', () => {
  const projectId = thisweekAccomplishedTasks[0]._projectId

  let TaskApi: TaskAPI
  let SubtaskApi: SubtaskAPI
  let ReportApi: ReportAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    TaskApi = new TaskAPI()
    SubtaskApi = new SubtaskAPI()
    ReportApi = new ReportAPI()
    httpBackend = new Backend()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('accomplished task in this week test:' , () => {
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=task`)
        .respond(JSON.stringify(thisweekAccomplishedTasks))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, thisweekAccomplishedTasks[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, thisweekAccomplishedTasks[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {
      const mocktask = clone(thisweekAccomplishedTasks[0])
      mocktask._id = 'mocktask'

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mocktask))

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedTasks.length + 1)
          expectDeepEqual(r[0], mocktask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      const taskId = thisweekAccomplishedTasks[0]._id

      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedTasks.length - 1)
          notInclude(r, thisweekAccomplishedTasks[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      const taskId = thisweekAccomplishedTasks[0]._id

      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedTasks.length - 1)
          notInclude(r, thisweekAccomplishedTasks[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      const taskId = thisweekAccomplishedTasks[0]._id

      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedTasks.length - 1)
          notInclude(r, thisweekAccomplishedTasks[0])
          done()
        })

      TaskApi.updateStatus(taskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('accomplished subtask in this week test: ', () => {
    const mockSubtask = clone(thisweekAccomplishedSubtasks[0])
    const subtaskId = mockSubtask._id
    mockSubtask._id = 'mocksubtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=subtask`)
        .respond(JSON.stringify(thisweekAccomplishedSubtasks))

      httpBackend.whenGET(`${apihost}subtasks/${mockSubtask._id}`)
        .respond(JSON.stringify(mockSubtask))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, thisweekAccomplishedSubtasks[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, thisweekAccomplishedSubtasks[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('add new subtask should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedSubtasks.length + 1)
          expectDeepEqual(r[0], mockSubtask)
          done()
        })

      SubtaskApi.get(mockSubtask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete subtask should ok', done => {

      httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedSubtasks.length - 1)
          notInclude(r, thisweekAccomplishedSubtasks[0])
          done()
        })

      SubtaskApi.delete(subtaskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {

      httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: subtaskId
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: true
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(thisweekAccomplishedSubtasks.length - 1)
          notInclude(r, thisweekAccomplishedSubtasks[0])
          done()
        })

      SubtaskApi.updateStatus(subtaskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('accomplished task before this week test: ', () => {
    const page1 = beforeThisweekAccomplishedTasks.slice(0, 20)
    const page2 = beforeThisweekAccomplishedTasks.slice(20)
    const mockTask = clone(beforeThisweekAccomplishedTasks[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('accomplished subtask before this week test: ', () => {
    const page1 = beforeThisweekAccomplishedSubtasks.slice(0, 20)
    const page2 = beforeThisweekAccomplishedSubtasks.slice(20)

    const mockSubtask = clone(page1[0])
    const subtaskId = mockSubtask._id
    mockSubtask._id = 'mocksubtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=1&count=20&taskType=subtask`)
        .respond(JSON.stringify(page1))
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new subtask should ok', done => {

      httpBackend.whenGET(`${apihost}subtasks/mocksubtask`)
        .respond(JSON.stringify(mockSubtask))

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockSubtask)
          done()
        })

      SubtaskApi.get(mockSubtask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete subtask should ok', done => {

      httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.delete(subtaskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {

      httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: subtaskId
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'all',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.updateStatus(subtaskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('accomplished delay tasks test: ', () => {
    const page1 = accomplishedDelayTasks.slice(0, 20)
    const page2 = accomplishedDelayTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=delay&isWeekSearch=false&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=delay&isWeekSearch=false&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('accomplished delay subtask test: ', () => {
    const page1 = accomplishedDelaySubtasks.slice(0, 20)
    const page2 = accomplishedDelaySubtasks.slice(20)

    const mockSubtask = clone(page1[0])
    const subtaskId = mockSubtask._id
    mockSubtask._id = 'mocksubtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=delay&isWeekSearch=false&page=1&count=20&taskType=subtask`)
        .respond(JSON.stringify(page1))
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=delay&isWeekSearch=false&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new subtask should ok', done => {

      httpBackend.whenGET(`${apihost}subtasks/mocksubtask`)
        .respond(JSON.stringify(mockSubtask))

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockSubtask)
          done()
        })

      SubtaskApi.get(mockSubtask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete subtask should ok', done => {

      httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.delete(subtaskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {

      httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: subtaskId
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'delay',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.updateStatus(subtaskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('accomplished ontime tasks test: ', () => {
    const page1 = accomplishedOntimeTasks.slice(0, 20)
    const page2 = accomplishedOntimeTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=ontime&isWeekSearch=false&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=ontime&isWeekSearch=false&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: taskId
        })

      ReportApi.getAccomplished(projectId, 'task', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('accomplished delay subtask test: ', () => {
    const page1 = accomplishedOntimeSubtasks.slice(0, 20)
    const page2 = accomplishedOntimeSubtasks.slice(20)

    const mockSubtask = clone(page1[0])
    const subtaskId = mockSubtask._id
    mockSubtask._id = 'mocksubtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=ontime&isWeekSearch=false&page=1&count=20&taskType=subtask`)
        .respond(JSON.stringify(page1))
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=ontime&isWeekSearch=false&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new subtask should ok', done => {

      httpBackend.whenGET(`${apihost}subtasks/mocksubtask`)
        .respond(JSON.stringify(mockSubtask))

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockSubtask)
          done()
        })

      SubtaskApi.get(mockSubtask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete subtask should ok', done => {

      httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
        .respond({})

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.delete(subtaskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {

      httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
        isDone: false
      })
        .respond({
          isDone: false,
          _id: subtaskId
        })

      ReportApi.getAccomplished(projectId, 'subtask', {
        queryType: 'ontime',
        isWeekSearch: false,
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.updateStatus(subtaskId, false)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('inprogress delay tasks test: ', () => {
    const page1 = inprogressDelayTasks.slice(0, 20)
    const page2 = inprogressDelayTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=delay&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=delay&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'delay',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('inprogress ontime tasks test: ', () => {
    const page1 = inprogressOntimeTasks.slice(0, 20)
    const page2 = inprogressOntimeTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=ontime&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=ontime&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'ontime',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('inprogress all tasks test: ', () => {
    const page1 = inprogressAllTasks.slice(0, 20)
    const page2 = inprogressAllTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=all&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=all&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe({
          next: () => {
            done()
          }
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: taskId
        })

      ReportApi.getInprogress(projectId, 'task', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('inprogress subtask test: ', () => {
    const page1 = inprogressSubtasks.slice(0, 20)
    const page2 = inprogressSubtasks.slice(20)

    const mockSubtask = clone(page1[0])
    const subtaskId = mockSubtask._id
    mockSubtask._id = 'mocksubtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=all&page=1&count=20&taskType=subtask`)
        .respond(JSON.stringify(page1))
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-in-progress?queryType=all&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (subtask, pos) => {
            expectDeepEqual(subtask, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
          done()
        })

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout4)
        .subscribe()

      httpBackend.flush()
    })

    it('add new subtask should ok', done => {
      httpBackend.whenGET(`${apihost}subtasks/mocksubtask`)
        .respond(JSON.stringify(mockSubtask))

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockSubtask)
          done()
        })

      SubtaskApi.get(mockSubtask._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete subtask should ok', done => {

      httpBackend.whenDELETE(`${apihost}subtasks/${subtaskId}`)
        .respond({})

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.delete(subtaskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {

      httpBackend.whenPUT(`${apihost}subtasks/${subtaskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: subtaskId
        })

      ReportApi.getInprogress(projectId, 'subtask', {
        queryType: 'all',
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      SubtaskApi.updateStatus(subtaskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

  })

  describe('not start tasks test: ', () => {
    const page1 = notStartTasks.slice(0, 20)
    const page2 = notStartTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mocktask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-not-started?page=1&count=20`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-not-started?page=2&count=20`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getNotStart(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getNotStart(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getNotStart(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {

      httpBackend.whenGET(`${apihost}tasks/mocktask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mocktask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: taskId
        })

      ReportApi.getNotStart(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

  describe('unassigned tasks test: ', () => {
    const page1 = unassignTasks.slice(0, 20)
    const page2 = unassignTasks.slice(20)
    const mockTask = clone(page1[0])
    const taskId = mockTask._id
    mockTask._id = 'mockunassignedtask'

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-unassigned?page=1&count=20`)
        .respond(JSON.stringify(page1))

      httpBackend.whenGET(`${apihost}projects/${projectId}/report-unassigned?page=2&count=20`)
        .respond(JSON.stringify(page2))
    })

    it('get should ok', done => {
      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('get from cache should ok', done => {
      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .subscribe()

      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe(r => {
          forEach(r, (task, pos) => {
            expectDeepEqual(task, page1[pos])
          })
          expect(spy).to.be.calledOnce
          done()
        })

      httpBackend.flush()
    })

    it('get page2 should ok', done => {
      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          done()
        })

      ReportApi.getUnassigned(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('get page2 from cache should ok', done => {
      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + page2.length)
          expect(spy).to.be.calledTwice
        })

      ReportApi.getUnassigned(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      ReportApi.getUnassigned(projectId, {
        page: 2,
        count: 20
      })
        .subscribeOn(Scheduler.async, global.timeout3)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

    it('add new task should ok', done => {
      httpBackend.whenGET(`${apihost}tasks/mockunassignedtask`)
        .respond(JSON.stringify(mockTask))

      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length + 1)
          expectDeepEqual(r[0], mockTask)
          done()
        })

      TaskApi.get('mockunassignedtask')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete task should ok', done => {
      httpBackend.whenDELETE(`${apihost}tasks/${taskId}`)
        .respond({})

      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.delete(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive task should ok', done => {
      httpBackend.whenPOST(`${apihost}tasks/${taskId}/archive`)
        .respond({
          isArchived: true,
          _id: taskId
        })

      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.archive(taskId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('change status should ok', done => {
      httpBackend.whenPUT(`${apihost}tasks/${taskId}/isDone`, {
        isDone: true
      })
        .respond({
          isDone: true,
          _id: taskId
        })

      ReportApi.getUnassigned(projectId, {
        page: 1,
        count: 20
      })
        .skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(page1.length - 1)
          notInclude(r, page1[0])
          done()
        })

      TaskApi.updateStatus(taskId, true)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })
})
