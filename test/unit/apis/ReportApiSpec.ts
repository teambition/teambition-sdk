'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import {
  Backend,
  apihost,
  ReportAPI,
  BaseFetch,
  forEach
} from '../index'
import {
  reportTasksDoneThisweek,
  reportSubtasksDoneThisweek,
  projectTasksDoneBeforeThisWeek,
  projectSubtasksDoneBeforeThisWeek
} from '../../mock/reportTasks'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('Report API Test: ', () => {
  const projectId = reportTasksDoneThisweek[0]._projectId

  let ReportApi: ReportAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

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

  it('get accomplished task in this week should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=task`)
      .respond(JSON.stringify(reportTasksDoneThisweek))

    ReportApi.getAccomplished(projectId, 'task', {
      queryType: 'all',
      isWeekSearch: true
    })
      .subscribe(r => {
        forEach(r, (task, pos) => {
          expectDeepEqual(task, reportTasksDoneThisweek[pos])
        })
        done()
      })

    httpBackend.flush()
  })

  it('get accomplished task in this week from cache should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=task`)
      .respond(JSON.stringify([]))

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
          expectDeepEqual(task, reportTasksDoneThisweek[pos])
        })
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('get accomplished subtask in this week should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=subtask`)
      .respond(JSON.stringify(reportSubtasksDoneThisweek))

    ReportApi.getAccomplished(projectId, 'subtask', {
      queryType: 'all',
      isWeekSearch: true
    })
      .subscribe(r => {
        forEach(r, (subtask, pos) => {
          expectDeepEqual(subtask, reportSubtasksDoneThisweek[pos])
        })
        done()
      })

    httpBackend.flush()
  })

  it('get accomplished subtask in this week from cache should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=true&taskType=subtask`)
      .respond(JSON.stringify(reportSubtasksDoneThisweek))

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
          expectDeepEqual(subtask, reportSubtasksDoneThisweek[pos])
        })
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  describe('get accomplished task before this week: ', () => {
    const page1 = projectTasksDoneBeforeThisWeek.slice(0, 20)
    const page2 = projectTasksDoneBeforeThisWeek.slice(20)
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=1&count=20&taskType=task`)
        .respond(JSON.stringify(page1))
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
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
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
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=task`)
        .respond(JSON.stringify(page2))
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
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

  })

  describe('get accomplished subtask before this week: ', () => {
    const page1 = projectSubtasksDoneBeforeThisWeek.slice(0, 20)
    const page2 = projectSubtasksDoneBeforeThisWeek.slice(20)
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=1&count=20&taskType=subtask`)
        .respond(JSON.stringify(page1))
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
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
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
      httpBackend.whenGET(`${apihost}projects/${projectId}/report-accomplished?queryType=all&isWeekSearch=false&page=2&count=20&taskType=subtask`)
        .respond(JSON.stringify(page2))
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
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe(() => {
          done()
        })

      httpBackend.flush()
    })

  })

})
