'use strict'
import * as chai from 'chai'
import { Backend, apihost, StageAPI, forEach } from '../index'
import { stages } from '../../mock/stages'
import { tasklists } from '../../mock/tasklists'
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
  })

  it('create stage should ok', function* () {
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

    const signal = Stage.getAll(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Stage.create(<any>stageCrateInfo)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(length + 1)
        expect(data[0].name).to.equal('stage create test')
      })
  })

  it('delete stage should ok', function* () {
    const tasklistId = stages[0]._tasklistId
    const stageId = stages[0]._id
    const length = stages.length

    httpBackend.whenDELETE(`${apihost}stages/${stageId}`)
      .respond({})

    const signal = Stage.getAll(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Stage.delete(stageId)

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.equal(length - 1)
        expect(notInclude(data, stages[0])).to.be.true
      })
  })

  it('update stage should ok', function* () {
    const stageId = stages[0]._id
    const tasklistId = stages[0]._tasklistId
    const mockResponse = {
      _id: stageId,
      _tasklistId: tasklistId,
      name: 'stage updated test',
      updated: Date.now()
    }

    httpBackend.whenPUT(`${apihost}stages/${stageId}`, {
      name: 'stage updated test'
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Stage.getAll(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Stage.update(stageId, {
      name: 'stage updated test'
    })
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(data => {
        expect(data[0].name).to.equal('stage updated test')
      })
  })

  it('update stage ids should ok', function* () {
    const Stage = new StageAPI()
    const tasklistId = tasklists[0]._id
    const stageIds: string[] = stages.map(stage => stage._id)
      .sort(x => Math.random() * 2 - 1)

    httpBackend.whenPUT(`${apihost}tasklists/${tasklistId}/stageIds`, {
      stageIds: stageIds
    })
      .respond({
        stageIds: stageIds
      })

    httpBackend.whenGET(`${apihost}tasklists/${tasklistId}/stages`)
      .respond(JSON.stringify(stages))

    const signal = Stage.getAll(tasklistId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Stage.updateStageIds(tasklistId, <any>stageIds)
      .do(r => {
        expect(r).to.deep.equal({
          stageIds: stageIds
        })
      })

    yield signal.take(1)
      .do(data => {
        const _stageIds: string[] = []
        forEach(data, stage => {
          _stageIds.push(<any>stage._id)
        })
        expect(_stageIds).to.deep.equal(stageIds)
      })
  })
})
