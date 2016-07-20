'use strict'
import * as chai from 'chai'
import { apihost, TaskAPI, SocketMock, Backend, clone } from '../index'
import { flush } from '../utils'
import { tasksUndone} from '../../mock/tasksUndone'

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

  it('change task should ok', done => {

    TaskApi.get(mockTask._id)
      .skip(1)
      .subscribe(task => {
        expect(task.content).to.equal('mocktask')
        done()
      })

    Socket.emit('change', 'task', mockTask._id, {
      _id: mockTask._id,
      content: 'mocktask'
    })

    httpBackend.flush()
  })

  it('destroy task should ok', done => {
    TaskApi.get(mockTask._id)
      .skip(1)
      .subscribe(task => {
        expect(task).to.be.null
        done()
      })

    Socket.emit('destroy', 'task', mockTask._id)

    httpBackend.flush()
  })
})
