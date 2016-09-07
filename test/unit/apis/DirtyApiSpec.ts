'use strict'
import * as chai from 'chai'
import { TaskAPI, Backend, apihost, clone } from '../index'
import { tasksOneDayMe } from '../../mock/tasksOneDayMe'
import { flush } from '../utils'

const expect = chai.expect

export default describe('Dirty APIs Spec', () => {
  let httpBackend: Backend
  let TaskApi: TaskAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    TaskApi = new TaskAPI()
  })

  it ('get tasks from my task api should ok', done => {
    const mockTask = clone(tasksOneDayMe[0])
    mockTask.subtaskCount = {
      total: 10,
      done: 2
    }

    const userId = mockTask._executorId

    httpBackend.whenGET(`${apihost}tasks/${tasksOneDayMe[0]._id}`)
      .respond(JSON.stringify(mockTask))

    httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=false&isDone=false`)
      .respond(JSON.stringify(tasksOneDayMe))

    const getTasks$ = TaskApi.get(mockTask._id)

    const loading$ = getTasks$
      .toLoading()
      .skip(1)

    getTasks$.subscribe()

    loading$.concatMap(() => {
      return TaskApi.getMyTasks(userId)
    })
      .subscribe(r => {
        expect(r[0].subtaskCount).to.deep.equal(mockTask.subtaskCount)
        done()
      })

    httpBackend.flush()
  })
})
