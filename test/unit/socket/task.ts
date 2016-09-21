'use strict'
import * as chai from 'chai'
import * as moment from 'moment'
import {
  apihost,
  TaskAPI,
  SocketMock,
  Backend,
  clone
} from '../index'
import { flush, notInclude } from '../utils'
import { tasksUndone} from '../../mock/tasksUndone'
import { tasksOneDayMe } from '../../mock/tasksOneDayMe'

const expect = chai.expect

export default describe('socket task test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let TaskApi: TaskAPI
  const mockTask = clone(tasksUndone[0])

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    TaskApi = new TaskAPI()

    httpBackend.whenGET(`${apihost}tasks/${mockTask._id}`)
      .respond(JSON.stringify(mockTask))
  })

  it('change task should ok', function* () {

    const signal = TaskApi.get(mockTask._id)
      .publish()
      .refCount()

    yield Socket.emit('change', 'task', mockTask._id, {
      _id: mockTask._id,
      content: 'mocktask'
    }, signal.take(1))

    yield signal.take(1)
      .do(task => {
        expect(task.content).to.equal('mocktask')
      })
  })

  it('destroy task should ok', function* () {
    const signal = TaskApi.get(mockTask._id)
      .publish()
      .refCount()

    signal.skip(1)
      .subscribe(r => {
        expect(r).to.be.null
      })

    yield Socket.emit('destroy', 'task', mockTask._id, null, signal.take(1))

  })

  describe('my tasks has dueDate: ', () => {
    const _userId = tasksOneDayMe[0]._executorId
    const dueDate = new Date().toISOString()

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=true&isDone=false`)
        .respond(JSON.stringify(tasksOneDayMe))
    })

    it('update task dueDate should ok', function* () {
      const signal = TaskApi.getMyDueTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('change', 'task', tasksOneDayMe[0]._id, {
        _id: tasksOneDayMe[0]._id,
        dueDate: null
      }, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          notInclude(data, tasksOneDayMe[0]._id)
        })
    })

    it('delete task should ok', function* () {
      const signal = TaskApi.getMyDueTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('destroy', 'task', tasksOneDayMe[0]._id, null, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          notInclude(data, tasksOneDayMe[0]._id)
        })
    })

    it('new task should ok', function* () {
      const signal = TaskApi.getMyDueTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('new', 'task', '', {
        _id: 'mocktaskid',
        content: 'mock task content',
        dueDate: moment(dueDate).add(1, 'hour').toISOString() ,
        _tasklistId: tasksOneDayMe[0]._tasklistId,
        _executorId: tasksOneDayMe[0]._executorId
      }, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length + 1)
          expect(data[0]._id).to.equal('mocktaskid')
        })
    })

  })

  describe('my tasks have no dueDate: ', () => {
    const _userId = tasksOneDayMe[0]._executorId

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}v2/tasks/me?count=500&page=1&hasDueDate=false&isDone=false`)
        .respond(JSON.stringify(tasksOneDayMe))
    })

    it('update task dueDate should ok', function* () {
      const signal = TaskApi.getMyTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('change', 'task', tasksOneDayMe[0]._id, {
        _id: tasksOneDayMe[0]._id,
        dueDate: new Date().toISOString()
      }, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          notInclude(data, tasksOneDayMe[0]._id)
        })
    })

    it('delete task should ok', function* () {
      const signal = TaskApi.getMyTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('destroy', 'task', tasksOneDayMe[0]._id, null, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length - 1)
          notInclude(data, tasksOneDayMe[0]._id)
        })
    })

    it('new task should ok', function* () {
      const signal = TaskApi.getMyTasks(_userId)
        .publish()
        .refCount()

      yield Socket.emit('new', 'task', '', {
        _id: 'mocktaskid',
        content: 'mock task content',
        dueDate: null,
        _tasklistId: tasksOneDayMe[0]._tasklistId,
        _executorId: tasksOneDayMe[0]._executorId
      }, signal.take(1))

      yield signal.take(1)
        .do(data => {
          expect(data.length).to.equal(tasksOneDayMe.length + 1)
          expect(data[0]._id).to.equal('mocktaskid')
        })
    })
  })
})
