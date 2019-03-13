import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, SocketMock, UserMe } from '../index'
import userMe from '../fixtures/user.fixture'
import { mock, restore, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

describe('UserApi request spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  afterEach(function* () {
    restore(sdk)
    yield sdk.database.dispose()
  })

  it('getUser should response correct data', function* () {
    mockResponse(userMe)

    yield sdk.getUserMe()
      .values()
      .do(([user]) => {
        expectToDeepEqualForFieldsOfTheExpected(user, userMe)
      })
  })

  it('update should update cache', function* () {
    const newName = 'test user update'
    mockResponse({
      _id: userMe._id,
      name: newName
    })

    yield sdk.database.insert('User', userMe)

    yield sdk.updateUser({
      name: newName
    })

    yield sdk.database.get<UserMe>('User')
      .values()
      .do(([user]) => {
        expect(user.name).to.equal(newName)
      })
  })

  it('addEmail should add email to cache', function* () {
    const mockEmail = {
      email: 'test@teambition.com',
      state: 1,
      _id: '54cb6200d1b4c6af47abe111',
      id: '54cb6200d1b4c6af47abe111'
    }

    const newEmail = userMe.emails.concat(mockEmail)

    yield sdk.database.insert('User', userMe)

    mockResponse({
      _id: userMe._id,
      emails: newEmail
    })

    yield sdk.addEmail(mockEmail.email)

    yield sdk.database.get<UserMe>('User')
      .values()
      .do(([user]) => {
        expect(user.emails).to.deep.equal(newEmail)
      })
  })
})

describe('UserAPI socket spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(function* () {
    restore(sdk)
    yield sdk.database.dispose()
  })

  it('update name should update cache', function* () {
    const newName = 'test user update'

    yield sdk.database.insert('User', userMe)

    yield socket.emit('change', 'user', userMe._id, {
      _id: userMe._id,
      name: newName
    })

    yield sdk.database.get<UserMe>('User')
      .values()
      .do(([user]) => {
        expect(user.name).to.equal(newName)
      })
  })
})
