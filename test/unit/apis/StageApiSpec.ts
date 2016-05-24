'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import { Backend, apihost, StageAPI } from '../index'
import { stages } from '../../mock/stages'
import { expectDeepEqual, notInclude, flush } from '../utils'

const expect = chai.expect

export default describe('Stage API Test', () => {
  let httpBackend: Backend
  let Stage: StageAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Stage = new StageAPI()

    httpBackend.whenGET(`${apihost}tasklists/${stages[0]._tasklistId}/stages`)
      .respond(JSON.stringify(stages))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get stages by tasklist id should ok', done => {
    const tasklistId = stages[0]._tasklistId

    Stage.getAll(tasklistId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        done()
      })

    httpBackend.flush()
  })

  it('get stage by stage id should ok', done => {
    const tasklistId = stages[0]._tasklistId
    const stageId = stages[0]._id

    httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/stages/${stageId}`)
      .respond(JSON.stringify(stages[0]))

    Stage.getOne(tasklistId, stageId)
      .subscribe(stage => {
        expectDeepEqual(stage, stages[0])
        done()
      })

    httpBackend.flush()
  })

  it('create stage should ok', done => {
    const tasklistId = stages[0]._tasklistId
    const length = stages.length
    const stageCrateInfo = {
      name: 'stage create test',
      _tasklistId: tasklistId,
      _prevId: 'head'
    }

    httpBackend.whenPOST(`${apihost}stages`, stageCrateInfo)
      .respond({
        _id: 'test',
        _tasklistId: tasklistId,
        name: 'stage create test',
        isArchive: false
      })

    Stage.getAll(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(length + 1)
        expect(data[0].name).to.equal('stage create test')
        done()
      })

    Stage.create(stageCrateInfo)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('delete stage should ok', done => {
    const tasklistId = stages[0]._tasklistId
    const stageId = stages[0]._id
    const length = stages.length

    httpBackend.whenDELETE(`${apihost}stages/${stageId}`)
      .respond({})

    Stage.getAll(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(length - 1)
        expect(notInclude(data, stages[0])).to.be.true
        done()
      })

    Stage.delete(stageId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('update stage should ok', done => {
    const stageId = stages[0]._id
    const tasklistId = stages[0]._tasklistId

    httpBackend.whenPUT(`${apihost}stages/${stageId}`, {
      name: 'stage updated test'
    })
      .respond({
        _id: stageId,
        _tasklistId: tasklistId,
        name: 'stage updated test',
        updated: Date.now()
      })

    Stage.getAll(tasklistId)
      .skip(1)
      .subscribe(data => {
        expect(data[0].name).to.equal('stage updated test')
        done()
      })

    Stage.update(stageId, {
      name: 'stage updated test'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })
})
