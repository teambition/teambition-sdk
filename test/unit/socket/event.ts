'use strict'
import { Observable } from 'rxjs'
import * as chai from 'chai'
import * as moment from 'moment'
import {
  apihost,
  EventAPI,
  SocketMock,
  Backend,
  clone,
  concat,
  EventSchema
} from '../index'
import { flush, expectDeepEqual } from '../utils'
import { myEvents } from '../../mock/myEvents'
import { projectEvents } from '../../mock/projectEvents'

const expect = chai.expect

export default describe('socket event test: ', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let EventApi: EventAPI
  const event = clone(myEvents[0])

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    EventApi = new EventAPI()

    httpBackend.whenGET(`${apihost}events/${event._id}`)
      .respond(JSON.stringify(event))
  })

  it('change event should ok', done => {

    EventApi.get(event._id)
      .skip(1)
      .subscribe(r => {
        expect(r.title).to.equal('mock title')
        done()
      })

    Socket.emit('change', 'event', event._id, {
      _id: event._id,
      title: 'mock title'
    })

    httpBackend.flush()
  })

  it('destroy event should ok', done => {
    EventApi.get(event._id)
      .skip(1)
      .subscribe(r => {
        expect(r).to.be.null
        done()
      })

    Socket.emit('destroy', 'task', event._id)

    httpBackend.flush()
  })

  describe('my events socket: ', () => {
    const userId = myEvents[0]._creatorId
    const today = new Date(2016, 8, 4)

    let signal: Observable<EventSchema[]>

    beforeEach(() => {
      // http://project.ci/api/events/me?endDate=2016-08-04T16%3A00%3A00.000Z
      httpBackend.whenGET(`${apihost}events/me?endDate=${today.toISOString()}`)
        .respond(JSON.stringify(myEvents))

      signal = EventApi.getMyEvents(userId, today)
        .map(r => {
          const result: EventSchema[] = []
          r.forEach(event => {
            if (event.recurrence) {
              if (event.isBetween(today, 'feature')) {
                event.setStart(today)
                const eventsBetweenTimes = event.takeUntilTime(moment(today).add(1, 'week').toDate()).map(r => r.value)
                if (eventsBetweenTimes.length) {
                  concat(result, eventsBetweenTimes)
                } else {
                  result.push(event.next().value)
                }
              }
            } else {
              result.push(event)
            }
          })
          return result
        })
    })

    it('change recurrence date, my events should be notified', done => {
      const eventId = myEvents[0]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r[0].title).to.equal('new title')
          done()
        })

      Socket.emit('change', 'event', eventId, {
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        })

      httpBackend.flush()
    })

    it('change normal date, my events should be notified', done => {
      const eventId = myEvents[1]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r[8].title).to.equal('new title')
          done()
        })

      Socket.emit('change', 'event', eventId, {
        _id: eventId,
        title: 'new title',
        updated: new Date().toISOString()
      })

      httpBackend.flush()
    })

    it('delete recurrence date, my events should be notified', done => {
      const eventId = myEvents[0]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(33)
          done()
        })

      Socket.emit('destroy', 'event', eventId)

      httpBackend.flush()
    })

    it('delete normal event should ok', done => {
      const eventId = myEvents[1]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(40)
          done()
        })

      Socket.emit('destroy', 'event', eventId)

      httpBackend.flush()
    })

    it('add new normal event should ok', done => {
      const mockEvent = clone(myEvents[1])
      mockEvent._id = 'mockevent'

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(42)
          expectDeepEqual(r[0], mockEvent)
          done()
        })

      Socket.emit('new', 'event', '', mockEvent)

      httpBackend.flush()
    })

    it('add recurrence event should ok', done => {
      const mockEvent = clone(myEvents[0])
      mockEvent._id = 'mockrecurrence'
      mockEvent.title = 'mockrecurrencetest'

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(49)
          expect(r[0].title).to.equal('mockrecurrencetest')
          done()
        })

      Socket.emit('new', 'event', '', mockEvent)

      httpBackend.flush()
    })

    it('get event from my events, and update it should ok', done => {
      const comment = {
        action: 'comment',
        _creatorId: 'mockid',
        attachments: [],
        mentions: [],
        timestamp: Date.now()
      }
      const mockNew = clone(myEvents[0])
      const mockReapeat = clone(myEvents[0])
      mockNew._id = 'mock_new_event'
      mockNew.startDate = '2016-09-04T02:00:00.000Z'
      mockReapeat.recurrence = [
        'RRULE:FREQ=DAILY;DTSTART=20160721T020000Z;INTERVAL=1',
        'EXDATE:20160904T020000Z'
      ]

      httpBackend.whenPOST(`${apihost}events/${myEvents[0]._id}/comments_repeat_event`, comment)
        .respond(JSON.stringify({
          new: mockNew,
          repeat: mockReapeat,
          comment: {
            _id: 'mock_comment_id'
          }
        }))

      let events: EventSchema[]
      signal.subscribe(r => {
        events = r
      })

      setTimeout(() => {
        const eventId = events[0]._id
        EventApi.get(eventId)
          .skip(1)
          .subscribe(r => {
            expect(r._id).to.equal('mock_new_event')
            done()
          })

        Socket.emit('new', 'event', '', mockNew)
        Socket.emit('change', 'event', mockReapeat._id, mockReapeat)
      }, global.timeout2)

      httpBackend.flush()
    })
  })

  describe('project events socket: ', () => {
    const projectId = projectEvents[0]._projectId
    const today = new Date(2016, 8, 4)

    let signal: Observable<EventSchema[]>

    beforeEach(() => {
      // http://project.ci/api/projects/56988fb705ead4ae7bb8dcfe/events?startDate=2016-08-04T16%3A00%3A00.000Z
      httpBackend.whenGET(`${apihost}projects/${projectId}/events?startDate=${today.toISOString()}`)
        .respond(JSON.stringify(projectEvents))

      signal = EventApi.getProjectEvents(projectId, today)
        .map(r => {
          const result: EventSchema[] = []
          r.forEach(event => {
            if (event.recurrence) {
              if (event.isBetween(today, 'feature')) {
                event.setStart(today)
                const eventsBetweenTimes = event.takeUntilTime(moment(today).add(1, 'week').toDate()).map(r => r.value)
                if (eventsBetweenTimes.length) {
                  concat(result, eventsBetweenTimes)
                } else {
                  result.push(event.next().value)
                }
              }
            } else {
              result.push(event)
            }
          })
          return result
        })
    })

    it('change recurrence date, my events should be notified', done => {
      const eventId = projectEvents[0]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r[0].title).to.equal('new title')
          done()
        })

      Socket.emit('change', 'event', eventId, {
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        })

      httpBackend.flush()
    })

    it('change normal date, my events should be notified', done => {
      const eventId = projectEvents[1]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r[8].title).to.equal('new title')
          done()
        })

      Socket.emit('change', 'event', eventId, {
        _id: eventId,
        title: 'new title',
        updated: new Date().toISOString()
      })

      httpBackend.flush()
    })

    it('delete recurrence date, my events should be notified', done => {
      const eventId = projectEvents[0]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(23)
          done()
        })

      Socket.emit('destroy', 'event', eventId)

      httpBackend.flush()
    })

    it('delete normal event should ok', done => {
      const eventId = projectEvents[1]._id

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(30)
          done()
        })

      Socket.emit('destroy', 'event', eventId)

      httpBackend.flush()
    })

    it('add new normal event should ok', done => {
      const mockEvent = clone(projectEvents[1])
      mockEvent._id = 'mockevent'

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(32)
          expectDeepEqual(r[0], mockEvent)
          done()
        })

      Socket.emit('new', 'event', '', mockEvent)

      httpBackend.flush()
    })

    it('add recurrence event should ok', done => {
      const mockEvent = clone(projectEvents[0])
      mockEvent._id = 'mockrecurrence'
      mockEvent.title = 'mockrecurrencetest'

      signal.skip(1)
        .subscribe(r => {
          expect(r.length).to.equal(39)
          expect(r[0].title).to.equal('mockrecurrencetest')
          done()
        })

      Socket.emit('new', 'event', '', mockEvent)

      httpBackend.flush()
    })

    it('get event from project events, and update it should ok', done => {
      const comment = {
        action: 'comment',
        _creatorId: 'mockid',
        attachments: [],
        mentions: [],
        timestamp: Date.now()
      }
      const mockNew = clone(projectEvents[0])
      const mockReapeat = clone(projectEvents[0])
      mockNew._id = 'mock_new_event'
      mockNew.startDate = '2016-09-04T02:00:00.000Z'
      mockReapeat.recurrence = [
        'RRULE:FREQ=DAILY;DTSTART=20160721T020000Z;INTERVAL=1',
        'EXDATE:20160904T020000Z'
      ]

      httpBackend.whenPOST(`${apihost}events/${projectEvents[0]._id}/comments_repeat_event`, comment)
        .respond(JSON.stringify({
          new: mockNew,
          repeat: mockReapeat,
          comment: {
            _id: 'mock_comment_id'
          }
        }))

      let events: EventSchema[]
      signal.subscribe(r => {
        events = r
      })

      setTimeout(() => {
        const eventId = events[0]._id
        EventApi.get(eventId)
          .skip(1)
          .subscribe(r => {
            expect(r._id).to.equal('mock_new_event')
            done()
          })

        Socket.emit('new', 'event', '', mockNew)
        Socket.emit('change', 'event', mockReapeat._id, mockReapeat)
      }, global.timeout2)

      httpBackend.flush()
    })
  })

})
