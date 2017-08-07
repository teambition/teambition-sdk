import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { SDK, FileSchema } from 'teambition-sdk-core'
import { FilesFixture, SocketMock } from 'teambition-sdk-testutil'
import { createSdk } from '../index'
import { mock, restore, looseDeepEqual } from '../utils'

describe('FileApi Spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  describe('FileApi request spec', () => {
    it('should get file', function* () {
      const [ fixture ] = FilesFixture.projectFiles
      mockResponse(fixture)

      yield sdk.getFile(fixture._id)
        .values()
        .do(([r]) => {
          expect(r).to.deep.equal(fixture)
        })
    })

  })

  describe('FileApi socket spec', () => {
    it('new file should add cache', function* () {
      const [ fixture ] = FilesFixture.projectFiles

      yield socket.emit('new', 'work', '', fixture)

      yield sdk.database.get<FileSchema>('File', { where: { _id: fixture._id } })
        .values()
        .do(([r]) => {
          looseDeepEqual(r, fixture)
        })
    })

    it('update file should change cache', function* () {
      const [ fixture ] = FilesFixture.projectFiles

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
      const [ fixture ] = FilesFixture.projectFiles

      yield sdk.database.insert('File', fixture)

      yield socket.emit('destroy', 'work', fixture._id)

      yield sdk.database.get<FileSchema>('File', { where: { _id: fixture._id } })
        .values()
        .do((r) => expect(r.length).to.equal(0))
    })
  })
})
