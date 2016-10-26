'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import {
  Backend,
  ActivityAPI,
  apihost,
  forEach,
  clone,
  BaseFetch
} from '../index'
import { flush, expectDeepEqual } from '../utils'
import { activities } from '../../mock/activities'

const expect = chai.expect

export default describe('ActivityAPI test: ', () => {
  let httpBackend: Backend
  let Activity: ActivityAPI
  let spy: Sinon.SinonSpy

  const _boundToObjectId = activities[0]._boundToObjectId
  const _boundToObjectType = 'tasks'

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Activity = new ActivityAPI()
    spy = sinon.spy(BaseFetch.fetch, 'get')
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  describe ('get activities test: ', () => {
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}${_boundToObjectType}/${_boundToObjectId}/activities`)
        .respond(JSON.stringify(activities))
    })

    it('get should ok', done => {
      Activity.getActivities(<any>_boundToObjectType, <any>_boundToObjectId)
        .subscribe(data => {
          forEach(data, (activity, pos) => {
            expectDeepEqual(activity, activities[pos])
          })
          done()
        })

    })

    it('add should ok', function* () {
      const commentData = {
        _id: _boundToObjectId,
        objectType: 'tasks',
        content: 'haha'
      }
      const mockActivity = clone(activities[0])
      mockActivity._id = 'mockactivitytest'
      mockActivity['content'] = 'haha'

      httpBackend.whenPOST(`${apihost}tasks/${_boundToObjectId}/activities`, {
        content: 'haha'
      })
        .respond(JSON.stringify(mockActivity))

      const signal = Activity.getActivities(<any>_boundToObjectType, <any>_boundToObjectId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield Activity.addActivity(<any>commentData)

      yield Activity.getActivities(<any>_boundToObjectType, <any>_boundToObjectId)
        .take(1)
        .do(data => {
          expect(data.length).to.equal(activities.length + 1)
          expectDeepEqual(data[0], mockActivity)
        })

    })

    it('get activities from cache should ok', function* () {
      yield Activity.getActivities(<any>_boundToObjectType, <any>_boundToObjectId)
        .take(1)

      yield Activity.getActivities(<any>_boundToObjectType, <any>_boundToObjectId)
        .take(1)
        .do(data => {
          forEach(data, (activity, pos) => {
            expectDeepEqual(activity, activities[pos])
          })
          expect(spy).to.be.calledOnce
        })
    })
  })

  it('add activity should ok', done => {
    const commentData = {
      _id: _boundToObjectId,
      objectType: 'tasks',
      content: 'haha'
    }
    const mockActivity = clone(activities[0])
    mockActivity._id = 'mockactivitytest'
    mockActivity['content'] = 'haha'

    httpBackend.whenPOST(`${apihost}tasks/${_boundToObjectId}/activities`, {
      content: 'haha'
    })
      .respond(JSON.stringify(mockActivity))

    Activity.addActivity(<any>commentData)
      .subscribe(data => {
        expectDeepEqual(data, mockActivity)
        done()
      })
  })
})
