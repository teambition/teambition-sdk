'use strict'
import * as chai from 'chai'
import { Scheduler } from 'rxjs'
import { Backend, ActivityAPI, apihost, forEach, clone } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { activities } from '../../mock/activities'

const expect = chai.expect

export default describe('ActivityAPI test: ', () => {
  let httpBackend: Backend
  let Activity: ActivityAPI

  const _boundToObjectId = activities[0]._boundToObjectId

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Activity = new ActivityAPI()
  })

  describe ('get activities test: ', () => {
    beforeEach(() => {
      httpBackend.whenGET(`${apihost}activities?_boundToObjectId=${_boundToObjectId}`)
        .respond(JSON.stringify(activities))
    })

    it('get should ok', done => {
      Activity.getActivities(_boundToObjectId)
        .subscribe(data => {
          forEach(data, (activity, pos) => {
            expectDeepEqual(activity, activities[pos])
          })
          done()
        })

      httpBackend.flush()
    })

    it('add should ok', done => {
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

      Activity.getActivities(_boundToObjectId)
        .skip(1)
        .subscribe(data => {
          expect(data.length).to.equal(activities.length + 1)
          expectDeepEqual(data[0], mockActivity)
          done()
        })

      Activity.addActivity(commentData)
        .subscribeOn(Scheduler.async, global.timeout2)
        .subscribe()

      httpBackend.flush()
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

    Activity.addActivity(commentData)
      .subscribe(data => {
        expectDeepEqual(data, mockActivity)
        done()
      })

    httpBackend.flush()
  })
})
