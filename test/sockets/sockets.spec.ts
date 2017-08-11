import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, SDKFetch, SocketClient, WSMiddleware as midware } from '../'
import { restore, expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import * as sinon from 'sinon'
import { Logger } from 'reactivedb'

const fetchMock = require('fetch-mock')

describe('Socket handling Spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should warn but not throw when the target table is non-existent', function* () {
    const logger = Logger.get('teambition-sdk')
    const spy = sinon.spy(logger, 'warn')
    const tx: any = 'Non-existent-table'
    yield socket.emit('new', tx, '', {})
    expect(spy).to.be.calledWith(`Table not found for message of type ${tx}`)
    spy.restore()
  })

  it('should ignore when `type` on message is empty', function* () {
    const result = socket.makeMessage({
      id: 'bep2f21oz18m:1' as any,
      jsonrpc: '2.0',
      method: 'publish',
      params: [{
        appid: '58f95e92c06a546f7dab73c7',
        collapsekey: '',
        data: '{"e":":action:","d":{"action":"import-tasks","status":"success","body":{"_tasklistId":"597fdea5528664cd3c81ebfa"}}}'
      }]
    })

    const r = yield sdk.socketClient['_onmessage'](result as any)

    expect(r).to.be.null
  })

  it('should do db:upsert for all the updates in { e: ":change:{modelType}s/{boundToObjectId}", d: "[update1, update2, ...]"}', function* () {
    const _projectId = '597fdea5528664cd3c81ebd9'
    const taskUndone = [
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e6', _projectId },
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e7', _projectId },
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e8', _projectId }
    ]
    const taskDone = taskUndone.map((undone) => ({ _id: undone._id, isDone: true }))

    yield sdk.database.upsert('Task', taskUndone)

    yield socket.emit('change', 'tasks', _projectId, taskDone)

    yield sdk.database.get('Task', { where: { isDone: true } })
      .values()
      .do((rs) => {
        expect(rs).to.have.lengthOf(taskDone.length)
        rs.forEach((r: any) => {
          const expectedTask = { ...taskUndone.find(({ _id }) => _id === r._id), isDone: true }
          expectToDeepEqualForFieldsOfTheExpected(r, expectedTask)
        })
      })
  })

  it('should do db:remove for all the PKs to be deleted in { e: ":remove:{modelType}s/{boundToObjectId}", d: "[pk1, pk2, ...]"}', function* () {
    const _projectId = '597fdea5528664cd3c81ebd9'
    const tasks = [
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e6', _projectId },
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e7', _projectId },
      { isDone: false, _id: '5a17b9a5a58dd8a0cddec5e8', _projectId }
    ]

    yield sdk.database.upsert('Task', tasks)

    yield socket.emit('remove', 'tasks', _projectId, tasks.map(({ _id }) => _id).slice(0, 2))

    yield sdk.database.get('Task')
      .values()
      .do((rs) => {
        expect(rs).to.have.lengthOf(1)
        const [r] = rs
        expectToDeepEqualForFieldsOfTheExpected(r, tasks[2])
      })
  })

  it('should do db:remove on { e: ":destroy:{modelType}/{modelId}", d: "" }', function* () {
    const modelId = '587ee5510f399a3a37e0e182'
    const postSample = {
      _id: '587ee5510f399a3a37e0e182',
      _projectId: '56988fb705ead4ae7bb8dcfe'
    }

    yield sdk.database.insert('Post', postSample)

    yield socket.emit('destroy', 'post', modelId)

    yield sdk.database.get('Post', { where: { _id: modelId } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })

  it('should do db:remove on { e: ":remove:{collectionType}/{collectionId}", d: "{modelId}" }', function* () {
    const collectionId = '597fdea5528664cd3c81ebfa'
    const modelId = '597fdea5528664cd3c81ebfd'
    const stageSample = {
      _id: modelId,
      _tasklistId: collectionId
    }

    yield sdk.database.insert('Stage', stageSample)

    yield socket.emit('remove', 'stages' as any, collectionId, modelId)

    yield sdk.database.get('Stage', { where: { _id: modelId } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })

  it('should do db:remove on { e: ":remove:{collectionType}", d: "{modelId}" }', function* () {
    const modelId = '59a3aea25e25ef050c28ce4f'
    const commentSample = {
      _id: modelId,
      action: 'activity.comment'
    }

    yield sdk.database.insert('Activity', commentSample)

    yield socket.emit('remove', 'activities' as any, '', modelId)

    yield sdk.database.get('Activity', { where: { _id: modelId } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })
})

describe('Socket interceptors', () => {
  let sdk: SDK
  let client: SocketClient

  let commentSample: any
  const modelId = '59a3aea25e25ef050c28ce4f'

  beforeEach(() => {
    sdk = createSdk()
    client = sdk.socketClient
    commentSample = {
      _id: modelId,
      action: 'activity.comment'
    }
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should allow interceptor to mutate message', function* () {
    client.interceptors.append((msg) => {
      if (msg.data.title == null) {
        msg.data.title = 'hello'
      } else if (msg.data.title === 'hello world') {
        delete msg.data.title
      }
    }, { mutate: true })

    const server = new SocketMock(client)

    yield server.emit('new', 'event' as any, '', commentSample)

    // 添加 message title 字段有效：得到数据库中相应行的 title 为 'hello'
    yield sdk.database.get('Event', { where: { _id: modelId } })
      .values()
      .do(([r]) => {
        expect((r as any).title).to.equal('hello')
      })

    yield server.emit('change', 'event' as any, modelId, { title: 'hello world' })

    // 删除 message title 字段有效：使得数据库中相应行的 title 保持不变，为 'hello'
    yield sdk.database.get('Event', { where: { _id: modelId } })
      .values()
      .do(([r]) => {
        expect((r as any).title).to.equal('hello')
      })
  })

  it('should allow interceptor to ignore default DB ops', function* () {
    client.interceptors.append((_) => {
      return midware.ControlFlow.IgnoreDefaultDBOps
    })

    const server = new SocketMock(client)

    yield sdk.database.insert('Activity', commentSample)

    yield server.emit('remove', 'activities' as any, '', modelId)

    yield sdk.database.get('Activity', { where: { _id: modelId } })
      .values()
      .do((r) => {
        expect(r.length).to.equal(1)
      })
  })

  it('should allow an interceptor to shortcircuit a sequence of interceptors', function* () {
    client.interceptors.append((msg) => { // -> 'hello'
      msg.data.title = 'hello'
    }, { mutate: true })

    client.interceptors.append((msg) => { // -> 'hello world'
      msg.data.title += ' world'
      return midware.ControlFlow.ShortCircuit
    }, { mutate: true })

    client.interceptors.append((msg) => { // -> ''
      msg.data.title = ''
    }, { mutate: true })

    const server = new SocketMock(client)

    yield server.emit('new', 'event' as any, '', commentSample)

    yield sdk.database.get('Event', { where: { _id: modelId } })
      .values()
      .do(([r]) => {
        expect((r as any).title).to.equal('hello world')
      })
  })

  it('should not allow a UserFunc to mutate message when mutateMessage flag is not set', function* () {
    client.interceptors.append((msg) => {
      msg.data.title = 'hello'
    })

    const server = new SocketMock(client)

    yield server.emit('new', 'event' as any, '', commentSample)

    yield sdk.database.get('Event', { where: { _id: modelId } })
      .values()
      .do(([r]) => {
        expect((r as any).title).to.be.undefined
      })
  })

  it('should allow a UserFunc to give up control flow flags set on interceptor creation', function* () {
    client.interceptors.append((msg) => { // -> 'hello'
      if (msg.data.title == null) {
        msg.data.title = 'hello'
        return midware.ControlFlow.ShortCircuit
      } else {
        return midware.ControlFlow.PassThrough
      }
    }, { mutate: true })

    client.interceptors.append((msg) => { // -> x + ' world'
      msg.data.title += ' world'
    }, { mutate: true })

    const server = new SocketMock(client)

    yield server.emit('new', 'event' as any, '', commentSample)

    yield sdk.database.get('Event', { where: { _id: modelId } })
      .values()
      .do(([r]) => {
        expect((r as any).title).to.equal('hello')
      })

    yield server.emit('change', 'event', modelId, { title: 'hello' })

    yield sdk.database.get('Event', { where: { _id: modelId } })
    .values()
    .do(([r]) => {
      expect((r as any).title).to.equal('hello world')
    })
  })

})

describe('join/leave `room`', () => {

  const sampleRoom = 'projects'
  const sampleConsumerId = '123helloworld456'

  let sdkFetch: SDKFetch

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('joinRoom should POST consumerId to :room/subscribe', async () => {
    const expectedUrl = `/${sampleRoom}/subscribe`

    fetchMock.postOnce(expectedUrl, { status: 200 })

    await sdkFetch.joinRoom(sampleRoom, sampleConsumerId)

    expect(fetchMock.lastUrl()).to.equal(expectedUrl)
    expect(fetchMock.lastOptions().body).to.equal(`{"consumerId":"${sampleConsumerId}"}`)
  })

  it('leaveRoom should DELETE consumerId from :room/subscribe', async () => {
    const expectedUrl = `/${sampleRoom}/subscribe`

    fetchMock.deleteOnce(expectedUrl, { status: 200 })

    await sdkFetch.leaveRoom(sampleRoom, sampleConsumerId)

    expect(fetchMock.lastUrl()).to.equal(expectedUrl)
    expect(fetchMock.lastOptions().body).to.equal(`{"consumerId":"${sampleConsumerId}"}`)
  })
})
