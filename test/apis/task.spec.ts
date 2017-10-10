import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, TaskSchema } from '../index'
import * as Fixture from '../fixtures/tasks.fixture'
import { mock, restore, looseDeepEqual, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

describe('TaskApi request Spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should get task', function* () {
    const fixture = Fixture.task
    mockResponse(fixture)

    yield sdk.getTask(fixture._id)
      .values()
      .do(([r]) => {
        expectToDeepEqualForFieldsOfTheExpected(r, fixture, 'subtasks', 'ancestors')
      })
  })
})

describe('TaskApi socket spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('new task should add cache', function* () {
    const fixture = Fixture.task

    yield socket.emit('new', 'task', '', fixture)

    yield sdk.database.get<TaskSchema>('Task', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => {
        delete r.project
        looseDeepEqual(r, fixture)
      })
  })

  it('update task should change cache', function* () {
    const fixture = Fixture.task

    yield sdk.database.insert('Task', fixture)

    yield socket.emit('change', 'task', fixture._id, {
      _id: fixture._id,
      content: 'fixture'
    })

    yield sdk.database.get<TaskSchema>('Task', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => expect(r.content).to.equal('fixture'))
  })

  it('delete task should delete cache', function* () {
    const fixture = Fixture.task

    yield sdk.database.insert('Task', fixture)

    yield socket.emit('destroy', 'task', fixture._id)

    yield sdk.database.get<TaskSchema>('Task', { where: { _id: fixture._id } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })
})
