'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import { Backend, PostAPI, apihost, forEach, clone, BaseFetch } from '../index'
import { posts } from '../../mock/posts'
import { expectDeepEqual, flush, notInclude } from '../utils'

const expect = chai.expect

export default describe('post api test: ', () => {
  let httpBackend: Backend
  let PostApi: PostAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    PostApi = new PostAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe('get project posts: ', () => {
    const projectId = posts[0]._projectId

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}projects/${projectId}/posts?page=1&count=20`)
        .respond(JSON.stringify(posts))
    })

    it ('get should ok', done => {
      PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      }).subscribe(results => {
        forEach(results, (post, index) => {
          expectDeepEqual(post, posts[index])
        })
        done()
      })

    })

    it('get from cache should ok', function* () {
      yield PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      })
        .take(1)

      yield PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      })
        .take(1)
        .do(results => {
          forEach(results, (post, index) => {
            expectDeepEqual(post, posts[index])
          })
          expect(spy).to.be.calledOnce
        })

    })

    it('add new post should ok', function* () {
      const mockPost = clone(posts[0])
      const mockId = 'postmockid'
      mockPost._id = mockId

      httpBackend.whenGET(`${apihost}posts/${mockId}`)
        .respond(JSON.stringify(mockPost))

      const signal = PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.get(mockId).take(1)

      yield signal.take(1)
        .do(results => {
          expect(results.length).to.equal(posts.length + 1)
        })

    })

    it('delete post should ok', function* () {
      const deleteId = posts[0]._id

      httpBackend.whenDELETE(`${apihost}posts/${deleteId}`)
        .respond({})

      const signal = PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.delete(deleteId)

      yield signal.take(1)
        .do(results => {
          notInclude(results, posts[0])
          expect(results.length).to.equal(posts.length - 1)
        })
    })

    it('archive should ok', function* () {
      const archiveId = posts[0]._id
      const mockPost = clone(posts[0])
      mockPost.isArchived = true
      const mockResponse = {
        _id: archiveId,
        isArchived: true,
        updated: new Date().toISOString()
      }

      httpBackend.whenPOST(`${apihost}posts/${archiveId}/archive`)
        .respond(JSON.stringify(mockResponse))

      const signal = PostApi.getProjectPosts(projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.archive(archiveId)
        .do(r => {
          expect(r).to.deep.equal(mockResponse)
        })

      yield signal.take(1)
        .do(results => {
          expect(results.length).to.equal(posts.length - 1)
          notInclude(results, mockPost)
        })

    })

  })

  it('favorite a post should ok', function* () {
    const favoriteId = posts[0]._id

    const mockResponse = {
      isFavorite: true,
      isUpdated: true,
      isVisible: true,
      refType: 'post',
      created: posts[0].created,
      updated: new Date().toISOString(),
      creator: {
        _id: 'xxx',
        name: 'xxxxx',
        avatarUrl: 'xxxxxxx'
      },
      project: {
        _id: posts[0]._projectId,
        name: 'project',
      },
      data: {
        created: posts[0].created,
        updated: new Date().toISOString(),
        content: posts[0].content,
        title: posts[0].title
      },
      _refId: posts[0]._id,
      _creatorId: posts[0]._creatorId,
      _id: posts[0]._id
    }

    httpBackend.whenGET(`${apihost}posts/${favoriteId}`)
      .respond(JSON.stringify(posts[0]))

    httpBackend.whenPOST(`${apihost}posts/${favoriteId}/favorite`)
      .respond(JSON.stringify(mockResponse))

    const signal = PostApi.get(favoriteId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.favorite(favoriteId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.isFavorite).to.be.true
      })
  })

  it('like post should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id

    const mockResponse = {
      isLike: true,
      updated: new Date().toISOString(),
      _id: testPostId,
      likesCount: 1,
      likesGroup: [{
        _id: 'testuser',
        name: 'test user name'
      }]
    }

    httpBackend.whenPOST(`${apihost}posts/${testPostId}/like`)
      .respond(JSON.stringify(mockResponse))

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.like(testPostId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(post => {
        expect(post.isLike).to.be.true
      })
  })

  it('delete like post should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id

    const mockResponse = {
      isLike: false,
      updated: new Date().toISOString(),
      _id: testPostId,
      likesCount: 1,
      likesGroup: [{
        _id: 'testuser',
        name: 'test user name'
      }]
    }

    httpBackend.whenDELETE(`${apihost}posts/${testPostId}/like`)
      .respond(JSON.stringify(mockResponse))

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.dislike(testPostId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(post => {
        expect(post.isLike).to.be.false
      })
  })

  it('unarchive post should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id
    testPost.isArchived = true

    const mockResponse = {
      isArchived: false,
      updated: new Date().toISOString(),
      _id: testPostId
    }

    httpBackend.whenDELETE(`${apihost}posts/${testPostId}/archive`)
      .respond(JSON.stringify(mockResponse))

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.unarchive(testPostId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(post => {
        expect(post.isArchived).to.be.false
      })
  })

  it('update involves should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id
    const mockInvolves = ['aaaa', 'bbbb', 'cccc']

    const mockResponse = {
      involveMembers: mockInvolves,
      updated: new Date().toISOString(),
      _id: testPostId
    }

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    httpBackend.whenPUT(`${apihost}posts/${testPostId}/involveMembers`, {
      involveMembers: mockInvolves
    })
      .respond(JSON.stringify(mockResponse))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updatInvolves(testPostId, {
      involveMembers: mockInvolves
    })
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.involveMembers).to.deep.equal(mockInvolves)
      })
  })

  it('update pin should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id
    const mockResponse = {
      pin: true,
      updated: new Date().toISOString(),
      _id: testPostId
    }

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    httpBackend.whenPUT(`${apihost}posts/${testPostId}/pin`, {
      pin: true
    })
      .respond(JSON.stringify(mockResponse))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updatePin(testPostId, true)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.pin).to.be.true
      })
  })

  it('update tags should ok', function* () {
    const testPost = clone(posts[0])
    const testPostId = testPost._id
    const mockTags = ['dddd', 'eeee', 'ffff']

    const mockResponse = {
      tagIds: mockTags,
      updated: new Date().toISOString(),
      _id: testPostId
    }

    httpBackend.whenGET(`${apihost}posts/${testPostId}`)
      .respond(JSON.stringify(testPost))

    httpBackend.whenPUT(`${apihost}posts/${testPostId}/tagIds`, {
      tagIds: mockTags
    })
      .respond(JSON.stringify(mockResponse))

    const signal = PostApi.get(testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updateTags(testPostId, mockTags)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.tagIds).to.deep.equal(mockTags)
      })
  })
})
