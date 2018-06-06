import { describe, beforeEach, afterEach, it } from 'tman'
import { expect } from 'chai'
import { createSdk, SDK, PostSchema, SocketMock } from '../index'
import { projectPosts, myProjectPosts, tagPosts } from '../fixtures/posts.fixture'
import { mock, restore, equals } from '../utils'
import { shuffle } from 'lodash'
import { PostId, ProjectId, TagId, UserId } from 'teambition-types'

describe('PostApi request spec', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, delay?: number | Promise<any>) => void
  let defaultOrderBy: any

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
    defaultOrderBy = [
      { fieldName: 'pin', orderBy: 'DESC' },
      { fieldName: 'created', orderBy: 'DESC' },
      { fieldName: 'lastCommentedAt', orderBy: 'DESC' }
    ]
  })

  afterEach(() => {
    restore(sdk)
  })

  it('getPost should response correct data', function* () {
    const [ fixture ] = projectPosts

    mockResponse(fixture)

    yield sdk.getPost(fixture._id as PostId)
      .values()
      .do(([r]) => {
        expect(r).to.deep.equal(fixture)
      })
  })

  it('getAllProjects should response correct data', function* () {
    const projectId = projectPosts[0]._projectId as ProjectId
    const fixture = projectPosts.slice(0, 20)

    mockResponse(fixture)

    yield sdk.getAllProjectPosts(projectId, {
      type: 'all',
      page: 1,
      count: 20
    })
      .values()
      .do(r => {
        expect(r).to.deep.equal(fixture)
      })

    const fixture2 = projectPosts.slice(20, 40)

    mockResponse(fixture2)

    yield sdk.getAllProjectPosts(projectId, {
      type: 'all',
      page: 2,
      count: 20
    })
      .values()
      .do(r => {
        expect(r).to.deep.equal(fixture2)
      })
  })

  it('getAllProjects should response ordered data', function* () {
    const projectId = projectPosts[0]._projectId as ProjectId
    const fixture = projectPosts.slice(0, 20)
    const unordered = shuffle(fixture)

    mockResponse(unordered)

    yield sdk.getAllProjectPosts(projectId, {
      type: 'all',
      page: 1,
      count: 20,
      orderBy: defaultOrderBy
    })
      .values()
      .do(r => {
        expect(r).to.deep.equal(fixture)
      })
  })

  it('getMyProjectPosts should response correct data', function* () {
    const fixture = myProjectPosts.slice(0, 20)
    const userId = fixture[0]._creatorId as UserId
    const projectId = fixture[0]._projectId as ProjectId

    mockResponse(fixture)

    yield sdk.getMyProjectPosts(userId, projectId, {
      page: 1,
      count: 20,
      type: 'my'
    })
      .values()
      .do(r => {
        expect(r).to.deep.equal(fixture)
      })

    const fixture2 = myProjectPosts.slice(20)

    mockResponse(fixture2)

    yield sdk.getMyProjectPosts(userId, projectId, {
      page: 2,
      count: 20,
      type: 'my'
    })
      .values()
      .do(r => expect(r).to.deep.equal(fixture2))
  })

  it('getMyProjectPosts should response ordered data', function* () {
    const fixture = myProjectPosts.slice(0, 20)
    const userId = fixture[0]._creatorId as UserId
    const projectId = fixture[0]._projectId as ProjectId
    const unordered = shuffle(fixture)

    mockResponse(unordered)

    yield sdk.getMyProjectPosts(userId, projectId, {
      type: 'my',
      page: 1,
      count: 20,
      orderBy: defaultOrderBy
    })
      .values()
      .do(r => {
        expect(r).to.deep.equal(fixture)
      })
  })

  it('getPostsByTagId should response correct data', function* () {
    const fixture = '569de6be18bfe350733e2443' as TagId

    mockResponse(tagPosts)

    yield sdk.getPostsByTagId(fixture, {
      page: 1,
      count: 500
    })
      .values()
      .do(r => expect(r).to.deep.equal(tagPosts))
  })

  it('getPostsByTagId should response ordered data', function* () {
    const fixture = '569de6be18bfe350733e2443' as TagId
    const unordered = shuffle(tagPosts)

    mockResponse(unordered)

    yield sdk.getPostsByTagId(fixture, {
      page: 1,
      count: 500,
      orderBy: defaultOrderBy
    })
      .values()
      .do(r => expect(r).to.deep.equal(tagPosts))
  })

  it('createPost should create new post', function* () {
    const [ fixture ] = projectPosts
    mockResponse(fixture)

    yield sdk.createPost({
      _projectId: fixture._projectId as ProjectId,
      title: fixture.title,
      content: fixture.content,
      tagIds: fixture.tagIds,
      involveMembers: fixture.tagIds
    })

    yield sdk.database.get('Post', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => {
        equals(r, fixture)
      })
  })

  it('updatePost should update cache in ReactiveDB', function* () {
    const [ placeholder ] = myProjectPosts

    yield sdk.database.insert('Post', placeholder)

    const fixture = {
      _id: placeholder._id as PostId,
      title: 'new title'
    }

    mockResponse(fixture)

    yield sdk.updatePost(fixture._id, fixture)

    yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => expect(r.title).to.equal(fixture.title))
  })

  it('deletePost should delete cache in ReactiveDB', function* () {
    const [ placeholder ] = projectPosts

    yield sdk.database.insert('Post', placeholder)

    mockResponse({})

    yield sdk.deletePost(placeholder._id as PostId)

    yield sdk.database.get('Post', { where: { _id: placeholder._id } })
      .values()
      .do(r => expect(r.length).to.equal(0))
  })
})

describe('PostsAPI socket spec', () => {
  let sdk: SDK
  let socket: SocketMock

  beforeEach(() => {
    sdk = createSdk()
    socket = new SocketMock(sdk.socketClient)
  })

  afterEach(() => {
    restore(sdk)
  })

  it('should do response for socket::new', function* () {
    const [ fixture ] = projectPosts

    yield socket.emit('new', 'post', '', fixture)

    yield sdk.database.get('Post', { where: { _id: fixture._id } })
      .values()
      .do((r) => equals(r, [ fixture ]))
  })

  it('should do response for socket::change', function* () {
    const [ fixture ] = projectPosts

    yield sdk.database.insert('Post', fixture)

    yield socket.emit('change', 'post', fixture._id, {
      // 这边不提供主键信息，以确定当 socket 消息的 d 部分不
      // 包含主键信息时，前端依然可以顺利操作。
      content: 'fixture'
    })

    yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
      .values()
      .do(([r]) => expect(r.content).to.equal('fixture'))
  })

  it('should do response for socket::destory', function* () {
    const [ fixture ] = projectPosts

    yield sdk.database.insert('Post', fixture)

    yield socket.emit('destroy', 'post', fixture._id)

    yield sdk.database.get<PostSchema>('Post', { where: { _id: fixture._id } })
      .values()
      .do((r) => expect(r.length).to.equal(0))
  })
})
