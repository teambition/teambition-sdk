'use strict'
import * as chai from 'chai'
import { TaskAPI, Backend, apihost, clone, SocketMock, SocketClient } from '../index'
import { tasksOneDayMe } from '../../mock/tasksOneDayMe'
import { like } from '../../mock/like'
import { flush } from '../utils'

const expect = chai.expect

export default describe('Dirty APIs Spec', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let TaskApi: TaskAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    TaskApi = new TaskAPI()
    Socket = new SocketMock(SocketClient)
  })

  it ('get tasks from my task api should ok', done => {
    const mockTask = clone(tasksOneDayMe[0])
    mockTask.subtaskCount = {
      total: 10,
      done: 2
    }
    const userId = mockTask._executorId

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))

    httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=false&isDone=false`)
      .respond(JSON.stringify(tasksOneDayMe))

    const getTasks$ = TaskApi.get(<any>mockTask._id)

    const loading$ = getTasks$
      .toLoading()
      .skip(1)

    getTasks$.subscribe()

    loading$.concatMap(() => {
      return TaskApi.getMyTasks(<any>userId)
    })
      .subscribe(r => {
        expect(r[0].subtaskCount).to.deep.equal(mockTask.subtaskCount)
        done()
      })
  })

  it('socket update dirty task should ok', function* () {
    const mockTask = clone(tasksOneDayMe[0])
    mockTask._id = 'dirtytaskmock'

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))

    const getTasks$ = TaskApi.get(<any>mockTask._id)

    yield Socket.emit('change', 'task', mockTask._id, {
      executor: null,
      content: 'hello'
    }, getTasks$.take(1))

    yield getTasks$.take(1)
      .do(r => {
        expect(r.content).to.equal('hello')
        expect(r.executor).to.not.be.null
      })
  })

  it('like data change should not handled by bounded object', function* () {
    const mockTask = clone(tasksOneDayMe[0])
    mockTask._id = 'dirtytaskmock'

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))

    const getTasks$ = TaskApi.get(<any>mockTask._id)

    yield Socket.emit('change', 'task', mockTask._id, like, getTasks$.take(1))

    yield getTasks$.take(1)
      .do(r => {
        expect(r['likesGroup']).to.be.undefined
      })
  })
})
