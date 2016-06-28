'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import { apihost, StageAPI, TasklistAPI, Backend, clone, forEach } from '../index'
import { tasklists } from '../../mock/tasklists'
import { stages } from '../../mock/stages'
import { notInclude, flush, expectDeepEqual } from '../utils'

const expect = chai.expect

export default describe('tasklist api test', () => {
  let httpBackend: Backend
  let Tasklist: TasklistAPI
  let projectId: string

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Tasklist = new TasklistAPI()
    projectId = tasklists[0]._projectId

    httpBackend.whenGET(`${apihost}projects/${projectId}/tasklists`)
      .respond(JSON.stringify(tasklists))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get tasklists by projectId should ok', done => {
    Tasklist.getTasklists(projectId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        done()
      })

    httpBackend.flush()
  })

  it('get tasklist by tasklist id should ok', done => {
    const tasklist = tasklists[0]

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    Tasklist.getOne(tasklist._id)
      .subscribe(data => {
        expectDeepEqual(data, tasklist)
        done()
      })

    httpBackend.flush()
  })

  it('update tasklist should ok', done => {
    const tasklistId = tasklists[0]._id
    const patch = {
      title: 'tasklist update test'
    }

    httpBackend.whenPUT(`${apihost}tasklists/${tasklistId}`, patch)
      .respond(JSON.stringify(patch))

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.title).to.equal(patch.title)
        done()
      })

    Tasklist.update(tasklistId, patch)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()

  })

  it('delete tasklist should ok', done => {
    const tasklist = tasklists[0]
    const tasklistId = tasklist._id
    const length = tasklists.length

    httpBackend.whenDELETE(`${apihost}tasklists/${tasklistId}`)
      .respond({})

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    Tasklist.getTasklists(projectId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(length - 1)
        expect(notInclude(data, tasklists[0])).to.be.true
      })

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data).to.be.undefined
        done()
      })

    Tasklist.delete(tasklistId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('archive tasklist should ok', done => {
    const tasklist = tasklists[0]
    const tasklistId = tasklist._id
    const length = tasklists.length

    httpBackend.whenGET(`${apihost}tasklists/${tasklist._id}`)
      .respond(JSON.stringify(tasklist))

    httpBackend.whenPOST(`${apihost}tasklists/${tasklistId}/archive`)
      .respond({
        _id: tasklistId,
        isArchived: true,
        updated: Date.now()
      })

    Tasklist.getTasklists(projectId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).is.equal(length - 1)
        expect(notInclude(data, tasklists[0])).to.be.true
      })

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.isArchived).to.be.true
        done()
      })

    Tasklist.archive(tasklistId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('unarchive tasklist should ok', done => {
    const tasklist = clone(tasklists[0])
    tasklist.isArchived = true
    tasklist._id = 'unarchivetasklisttest'
    const length = tasklists.length

    const tasklistId = tasklist._id

    httpBackend.whenGET(`${apihost}tasklists/unarchivetasklisttest`)
      .respond(JSON.stringify(tasklist))

    httpBackend.whenDELETE(`${apihost}tasklists/unarchivetasklisttest/archive`)
      .respond({
        _id: 'unarchivetasklisttest',
        _projectId: projectId,
        isArchived: false,
        updated: Date.now()
      })

    Tasklist.getTasklists(projectId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(length + 1)
        expect(data[0]._id).to.equal('unarchivetasklisttest')
      })

    Tasklist.getOne(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.isArchived).to.be.false
        done()
      })

    Tasklist.unArchive('unarchivetasklisttest')
      .subscribeOn(Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()
  })

  it('update stage ids should ok', done => {
    const Stage = new StageAPI()
    const tasklistId = tasklists[0]._id
    const stageIds: string[] = stages.map(stage => stage._id)
      .sort(x => Math.random() * 2 - 1)

    httpBackend.whenPUT(`${apihost}tasklists/${tasklistId}/stageIds`, {
      stageIds: stageIds
    })
      .respond(stageIds)

    httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/stages`)
      .respond(JSON.stringify(stages))

    Stage.getAll(tasklistId)
      .skip(1)
      .subscribe(data => {
        const _stageIds: string[] = []
        forEach(data, stage => {
          _stageIds.push(stage._id)
        })
        expect(_stageIds).to.deep.equal(stageIds)
        done()
      })

    Tasklist.updateStageIds(tasklistId, stageIds)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })
})
