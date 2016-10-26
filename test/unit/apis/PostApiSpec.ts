'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import { Backend, PostAPI, apihost, forEach, clone, BaseFetch, uuid } from '../index'
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
      httpBackend.whenGET(`${apihost}projects/${projectId}/posts?page=1&count=20&type=all`)
        .respond(JSON.stringify(posts))
    })

    it ('get all posts should ok', done => {
      PostApi.getAllProjectPosts(<any>projectId, {
        page: 1,
        count: 20
      }).subscribe(results => {
        forEach(results, (post, index) => {
          expectDeepEqual(post, posts[index])
        })
        done()
      })
    })

    it('get all posts from cache should ok', function* () {
      yield PostApi.getAllProjectPosts(<any>projectId, {
        page: 1,
        count: 20
      })
        .take(1)

      yield PostApi.getAllProjectPosts(<any>projectId, {
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

    it('get my posts should ok', done => {
      const userId = posts[0]._creatorId
      const myposts = posts.filter(post => {
        return post._creatorId === userId
      })
      httpBackend.whenGET(`${apihost}projects/${projectId}/posts?page=1&count=20&type=my`)
        .respond(JSON.stringify(myposts))

      PostApi.getMyProjectPosts(<any>userId, <any>projectId, {
        page: 1,
        count: 20
      }).subscribe(results => {
        forEach(results, (post, index) => {
          expectDeepEqual(post, myposts[index])
        })
        done()
      })
    })

    it('get my posts from cache should ok', function* () {
      const userId = posts[0]._creatorId
      const myposts = posts.filter(post => {
        return post._creatorId === userId
      })
      httpBackend.whenGET(`${apihost}projects/${projectId}/posts?page=1&count=20&type=my`)
        .respond(JSON.stringify(myposts))

      yield PostApi.getMyProjectPosts(<any>userId, <any>projectId, {
        page: 1,
        count: 20
      })
        .take(1)

      yield PostApi.getMyProjectPosts(<any>userId, <any>projectId, {
        page: 1,
        count: 20
      })
        .take(1)
        .do(results => {
          forEach(results, (post, index) => {
            expectDeepEqual(post, myposts[index])
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('add new post to my posts should ok', function* () {
      const userId = posts[0]._creatorId
      const myposts = posts.filter(post => {
        return post._creatorId === userId
      })
      httpBackend.whenGET(`${apihost}projects/${projectId}/posts?page=1&count=20&type=my`)
        .respond(JSON.stringify(myposts))

      const mockPost = clone(posts[0])
      const mockId = 'postmockid'
      mockPost._id = mockId
      mockPost._creatorId = userId

      httpBackend.whenGET(`${apihost}posts/${mockId}`)
        .respond(JSON.stringify(mockPost))

      const signal = PostApi.getMyProjectPosts(<any>userId, <any>projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.get(<any>mockId).take(1)

      yield signal.take(1)
        .do(results => {
          expect(results.length).to.equal(myposts.length + 1)
        })
    })

    it('add new post should ok', function* () {
      const mockPost = clone(posts[0])
      const mockId = 'postmockid'
      mockPost._id = mockId

      httpBackend.whenGET(`${apihost}posts/${mockId}`)
        .respond(JSON.stringify(mockPost))

      const signal = PostApi.getAllProjectPosts(<any>projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.get(<any>mockId).take(1)

      yield signal.take(1)
        .do(results => {
          expect(results.length).to.equal(posts.length + 1)
        })

    })

    it('delete post should ok', function* () {
      const deleteId = posts[0]._id

      httpBackend.whenDELETE(`${apihost}posts/${deleteId}`)
        .respond({})

      const signal = PostApi.getAllProjectPosts(<any>projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.delete(<any>deleteId)

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

      const signal = PostApi.getAllProjectPosts(<any>projectId, {
        page: 1,
        count: 20
      })
        .publish()
        .refCount()

      yield signal.take(1)

      yield PostApi.archive(<any>archiveId)
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

  describe('get posts by tagId', () => {
    const mockTagId = 'mocktagid'
    const mockPosts = clone(posts).map(post => {
      post.tagIds = [mockTagId]
      return post
    })

    beforeEach(() => {
      httpBackend.whenGET(`${apihost}tags/${mockTagId}/posts`, {
        page: 1,
        count: 500
      })
        .respond(JSON.stringify(mockPosts))
    })

    it('get should ok', done => {
      PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })
        .subscribe(r => {
          forEach(r, (post, index) => {
            expectDeepEqual(post, mockPosts[index])
          })
          done()
        })
    })

    it('get from cache should ok', function* () {
      yield PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })
        .take(1)

      yield PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })
        .take(1)
        .do(r => {
          forEach(r, (post, index) => {
            expectDeepEqual(post, mockPosts[index])
          })
          expect(spy).to.be.calledOnce
        })
    })

    it('add new posts should ok', function* () {
      const mockPostId = 'mockpostid'
      const mockPost = clone(posts[0])
      mockPost._id = mockPostId
      mockPost.tagIds = [mockTagId]

      httpBackend.whenGET(`${apihost}posts/${mockPostId}`)
        .respond(JSON.stringify(mockPost))

      const signal = PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })

      yield signal.take(1)

      yield PostApi.get(<any>mockPostId).take(1)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length + 1)
          expectDeepEqual(r[0], mockPost)
        })
    })

    it('update tags should ok', function* () {
      const postId = posts[0]._id

      httpBackend.whenPUT(`${apihost}posts/${postId}/tagIds`, {
        tagIds: ['othertag']
      })
        .respond({
          _id: postId,
          tagIds: ['othertag'],
          updated: new Date().toISOString()
        })

      const signal = PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })

      yield signal.take(1)

      yield PostApi.updateTags(<any>postId, <any>['othertag'])

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length - 1)
          expect(notInclude(r, mockPosts[0]))
        })
    })

    it('delete post should ok', function* () {
      const postId = posts[0]._id

      httpBackend.whenDELETE(`${apihost}posts/${postId}`)
        .respond({})

      const signal = PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })

      yield signal.take(1)

      yield PostApi.delete(<any>postId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length - 1)
          expect(notInclude(r, mockPosts[0])).to.be.true
        })
    })

    it('archive should ok', function* () {
      const postId = posts[0]._id

      httpBackend.whenPOST(`${apihost}posts/${postId}/archive`)
        .respond({
          _id: postId,
          isArchived: true,
          updated: new Date().toISOString()
        })

      const signal = PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })

      yield signal.take(1)

      yield PostApi.archive(<any>postId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length - 1)
          expect(notInclude(r, mockPosts[0]))
        })
    })

    it('unarchive should ok', function* () {
      const mockPostId = 'mockpostid'
      const mockPost = clone(posts[0])
      mockPost._id = mockPostId
      mockPost.tagIds = [mockTagId]
      mockPost.isArchived = true

      httpBackend.whenGET(`${apihost}posts/${mockPostId}`)
        .respond(JSON.stringify(mockPost))

      httpBackend.whenDELETE(`${apihost}posts/${mockPostId}/archive`)
        .respond({
          _id: mockPostId,
          isArchived: false,
          updated: new Date().toISOString()
        })

      const signal = PostApi.getByTagId(<any>mockTagId, {
        page: 1,
        count: 500
      })

      yield signal.take(1)

      yield PostApi.get(<any>mockPostId).take(1)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length)
          expect(notInclude(r, mockPost)).to.be.true
        })

      yield PostApi.unarchive(<any>mockPostId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(mockPosts.length + 1)
          delete mockPost.isArchived
          delete mockPost.updated
          expectDeepEqual(mockPost, r[0])
        })
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

    const signal = PostApi.get(<any>testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.unarchive(<any>testPostId)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(post => {
        expect(post.isArchived).to.be.false
      })
  })

  it('should fork one to another project', function* () {

    const post = posts[0]
    const postId = post._id
    const misaki = clone(post)
    misaki._id = uuid()
    const projectId: any = misaki._projectId = uuid()

    httpBackend.whenGET(`${apihost}projects/${projectId}/posts?type=all`)
      .respond(JSON.stringify([]))

    httpBackend
      .whenPUT(`${apihost}posts/${postId}/fork`, {
        _projectId: projectId
      })
      .respond(JSON.stringify(misaki))

    const signal = PostApi.getAllProjectPosts(projectId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(0)
      })

    yield PostApi.fork(postId, projectId)
      .do(data => {
        expectDeepEqual(data, misaki)
      })

    yield signal.take(1)
      .do(data => {
        expect(data.length).to.be.equal(1)
        expectDeepEqual(data[0], misaki)
        expect(spy.callCount).to.be.equal(1)
      })
  })

  it('should move one to another project', function* () {

    const post = clone(posts[0])
    const postId = post._id
    const projectId = post._projectId
    const misaki = clone(post)
    const newProjectId: any = misaki._projectId = uuid()
    const newUpdated = misaki.updated = new Date().toISOString()

    httpBackend.whenGET(`${apihost}projects/${projectId}/posts?type=all`)
      .respond(JSON.stringify(posts))

    httpBackend.whenGET(`${apihost}projects/${newProjectId}/posts?type=all`)
      .respond(JSON.stringify([]))

    httpBackend
      .whenPUT(`${apihost}posts/${postId}/move`, {
        _projectId: newProjectId
      })
      .respond({
        _id: postId,
        _projectId: newProjectId,
        updated: newUpdated
      })

    const signalOne = PostApi.getAllProjectPosts(projectId)
      .publish()
      .refCount()

    const signalTwo = PostApi.getAllProjectPosts(newProjectId)
      .publish()
      .refCount()

    yield signalOne.take(1)
      .do(data => {
        expect(data.length).to.be.equal(posts.length)
        expectDeepEqual(data[0], post)
      })

    yield signalTwo.take(1)
      .do(data => {
        expect(data.length).to.be.equal(0)
      })

    yield PostApi.move(postId, newProjectId)
      .do(data => {
        expect(data._id).to.be.equal(postId)
        expect(data._projectId).to.be.equal(newProjectId)
      })

    yield signalOne.take(1)
      .do(data => {
        expect(data.length).to.be.equal(posts.length - 1)
      })

    yield signalTwo.take(1)
      .do(data => {
        expect(data.length).to.be.equal(1)
        expectDeepEqual(data[0], misaki)
        expect(spy.callCount).to.be.equal(2)
      })
  })

  it('should update one', function* () {

    const post = clone(posts[0])
    const postId = post._id = uuid()
    const patch = {title: uuid()}
    const response = {
      _id: postId,
      title: patch.title,
      updated: new Date().toISOString()
    }

    httpBackend
      .whenGET(`${apihost}posts/${postId}`)
      .respond(JSON.stringify(post))

    httpBackend
      .whenPUT(`${apihost}posts/${postId}`, patch)
      .respond(JSON.stringify(response))

    const signal = PostApi.get(<any>postId)

    yield signal.take(1)
      .do(result => {
        expectDeepEqual(result, post)
      })

    yield PostApi.update(<any>postId, patch)
      .do(result => {
        expectDeepEqual(result, response)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.title).to.be.equal(patch.title)
        expect(spy.callCount).to.be.equal(1)
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

    const signal = PostApi.get(<any>testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updateInvolves(<any>testPostId, {
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

    const signal = PostApi.get(<any>testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updatePin(<any>testPostId, true)
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

    const signal = PostApi.get(<any>testPostId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield PostApi.updateTags(<any>testPostId, <any>mockTags)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(result => {
        expect(result.tagIds).to.deep.equal(mockTags)
      })
  })
})
