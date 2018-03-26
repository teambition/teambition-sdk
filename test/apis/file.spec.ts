import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, FileSchema } from '../index'
import * as Fixture from '../fixtures/files.fixture'
import { mock, restore, looseDeepEqual, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

describe('FileApi request spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should get file', function* () {
    const [ fixture ] = Fixture.projectFiles
    mockResponse(fixture)

    yield sdk.getFile(fixture._id)
      .values()
      .do(([r]) => {
        expectToDeepEqualForFieldsOfTheExpected(r, fixture)
      })
  })
})

describe('FileApi socket spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('new file should add cache', function* () {
    const [ fixture ] = Fixture.projectFiles

    yield socket.emit('new', 'work', '', fixture)

    yield sdk.database.get<FileSchema>('File', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => {
        looseDeepEqual(r, fixture)
      })
  })

  it('update file should change cache', function* () {
    const [ fixture ] = Fixture.projectFiles

    yield sdk.database.insert('File', fixture)

    yield socket.emit('change', 'work', fixture._id, {
      _id: fixture._id,
      fileName: 'fixture'
    })

    yield sdk.database.get<FileSchema>('File', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => expect(r.fileName).to.equal('fixture'))
  })

  it('delete file should delete cache', function* () {
    const [ fixture ] = Fixture.projectFiles

    yield sdk.database.insert('File', fixture)

    yield socket.emit('destroy', 'work', fixture._id)

    yield sdk.database.get<FileSchema>('File', { where: { _id: fixture._id } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })
})
