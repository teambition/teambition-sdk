'use strict'
import * as chai from 'chai'
import * as moment from 'moment'
import { Observable } from 'rxjs/Observable'
import {
  apihost,
  Backend,
  EventAPI,
  RecurrenceEvent,
  clone,
  concat,
  EventSchema
} from '../index'
import { flush, expectDeepEqual } from '../utils'
import * as MockRecurrence from '../../mock/recurrenceEvents'
import { projectEvents } from '../../mock/projectEvents'
import { myEvents } from '../../mock/myEvents'

const expect = chai.expect

export default describe('Event test:', () => {
  let httpBackend: Backend
  let EventApi: EventAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    EventApi = new EventAPI()
  })

  describe('Recurrence Event test :', () => {
    it('recurrence by day should ok', () => {
      const day = MockRecurrence.day
      const Recurrence = new RecurrenceEvent(<any>day)
      const next = Recurrence.next()
      // 相差一天
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(day.startDate).add(1, 'day').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(day.endDate).add(1, 'day').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by week should ok', () => {
      const week = MockRecurrence.week
      const Recurrence = new RecurrenceEvent(<any>week)
      const next = Recurrence.next()
      // 相差一周
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(week.startDate).add(1, 'week').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(week.endDate).add(1, 'week').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by month should ok', () => {
      const month = MockRecurrence.month
      const Recurrence = new RecurrenceEvent(<any>month)
      const next = Recurrence.next()
      // 相差一个月
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(month.startDate).add(1, 'month').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(month.endDate).add(1, 'month').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by year should ok', () => {
      const year = MockRecurrence.year
      const Recurrence = new RecurrenceEvent(<any>year)
      const next = Recurrence.next()
      // 相差一年
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(year.startDate).add(1, 'year').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(year.endDate).add(1, 'year').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by customer day should ok', () => {
      const customerday = MockRecurrence.customerday
      const Recurrence = new RecurrenceEvent(<any>customerday)
      const next = Recurrence.next()
      // 相差 3 天
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(customerday.startDate).add(3, 'day').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(customerday.endDate).add(3, 'day').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by customer week should ok', () => {
      const customerweek = MockRecurrence.customerweek
      const Recurrence = new RecurrenceEvent(<any>customerweek)
      const day1 = Recurrence.next()
      const day2 = Recurrence.next()
      const day3 = Recurrence.next()

      const expected = [2, 3, 6]
      const actually = []
      actually.push(moment(day1.value.startDate).day())
      actually.push(moment(day2.value.startDate).day())
      actually.push(moment(day3.value.startDate).day())
      expect(actually.sort((a, b) => a - b)).to.deep.equal(expected)

      expect(Recurrence.take(5).length).to.equal(5)
      expect(Recurrence.next().done).to.be.false
    })

    it('recurrence by customer month should ok', () => {
      const customermonth = MockRecurrence.customermonth
      const Recurrence = new RecurrenceEvent(<any>customermonth)

      const day1 = Recurrence.next()
      const day2 = Recurrence.next()
      const day3 = Recurrence.next()
      const day4 = Recurrence.next()
      const day5 = Recurrence.next()

      expect(moment(day1.value.startDate).add(2, 'month').valueOf()).to.equal(moment(day5.value.startDate).valueOf())
      expect(moment(day1.value.endDate).add(2, 'month').valueOf()).to.equal(moment(day5.value.endDate).valueOf())

      const expected = [3, 11, 23, 26]
      const actually = []

      actually.push(moment(day1.value.startDate).date())
      actually.push(moment(day2.value.startDate).date())
      actually.push(moment(day3.value.startDate).date())
      actually.push(moment(day4.value.startDate).date())

      expect(actually.sort((a, b) => a - b)).to.deep.equal(expected)

      expect(Recurrence.next().done).to.be.false
    })

    it('takeUntilTime should ok', () => {
      const day = MockRecurrence.day
      const Recurrence = new RecurrenceEvent(<any>day)

      const result = Recurrence.takeUntilTime(new Date(moment(day.startDate).add(5, 'day').add(1, 'hour')))
      expect(result.length).to.equal(6)
    })

    it('takeByTime should ok', () => {
      const day = MockRecurrence.day
      const Recurrence = new RecurrenceEvent(<any>day)

      const result = Recurrence.takeByTime(new Date(moment(day.startDate).add(5, 'day')))
      expect(result.startDate).to.equal(moment(day.startDate).add(5, 'day').toISOString())
    })

    it('is between should ok', () => {
      const day = MockRecurrence.day
      const recurrence = new RecurrenceEvent(<any>day)

      expect(recurrence.isBetween(new Date(2015, 9, 1), new Date(2015, 12, 1))).to.be.false
      expect(recurrence.isBetween(new Date(2015, 9, 1), 'feature')).to.be.true
    })

  })

  describe('api test: ', () => {
    it('create event should ok', done => {
      const mockPost = {
        _projectId: '569df8b418bfe350733e2461',
        _creatorId: '56986d43542ce1a2798c8cfb',
        title: 'mocktest',
        startDate: '2016-07-21T11:00:00.000Z',
        endDate: '2016-07-21T12:00:00.000Z',
        involveMembers: ['56986d43542ce1a2798c8cfb'],
        visible: 'members',
        recurrence: MockRecurrence.day.recurrence
      }

      httpBackend.whenPOST(`${apihost}events`, mockPost)
        .respond(JSON.stringify(MockRecurrence.day))

      EventApi.create(<any>mockPost)
        .subscribe(r => {
          expect(r.recurrence).to.deep.equal(MockRecurrence.day.recurrence)
          done()
        })
    })

    it('get event should ok', done => {
      const mockEvent = projectEvents[1]

      httpBackend.whenGET(`${apihost}events/${mockEvent._id}`)
        .respond(JSON.stringify(mockEvent))

      EventApi.get(<any>mockEvent._id)
        .subscribe(r => {
          expectDeepEqual(mockEvent, r)
          done()
        })
    })

    it('update title should ok', function* () {
      const mockEvent = clone(projectEvents[1])

      httpBackend.whenGET(`${apihost}events/${mockEvent._id}`)
        .respond(JSON.stringify(mockEvent))

      httpBackend.whenPUT(`${apihost}events/${mockEvent._id}`, {
        title: 'new title'
      })
        .respond(JSON.stringify({
          _id: mockEvent._id,
          title: 'new title',
          updated: new Date().toISOString()
        }))

      const signal = EventApi.get(<any>mockEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.update(<any>mockEvent._id, {
        title: 'new title'
      })

      yield signal.take(1)
        .do(r => {
          expect(r.title).to.equal('new title')
        })
    })

    it('update recurrence should ok', function* () {
      const mockEvent = clone(projectEvents[1])

      httpBackend.whenGET(`${apihost}events/${mockEvent._id}`)
        .respond(JSON.stringify(mockEvent))

      httpBackend.whenPUT(`${apihost}events/${mockEvent._id}`, {
        recurrence: ['RRULE:FREQ=WEEKLY;DTSTART=20160801T030000Z;INTERVAL=1']
      })
        .respond(JSON.stringify({
          _id: mockEvent._id,
          recurrence: ['RRULE:FREQ=WEEKLY;DTSTART=20160801T030000Z;INTERVAL=1'],
          sourceDate: new Date(mockEvent.startDate).toISOString(),
          updated: new Date().toISOString()
        }))

      const signal = EventApi.get(<any>mockEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.update(<any>mockEvent._id, {
        recurrence: ['RRULE:FREQ=WEEKLY;DTSTART=20160801T030000Z;INTERVAL=1']
      })

      yield signal.take(1)
        .do(r => {
          expect(r.content).to.equal(mockEvent.content)
        })
    })

    it('delete event should ok', function* () {
      const eventId = projectEvents[0]._id

      httpBackend.whenGET(`${apihost}events/${eventId}`)
        .respond(JSON.stringify(projectEvents[0]))

      httpBackend.whenDELETE(`${apihost}events/${eventId}`)
        .respond(null)

      const signal = EventApi.get(<any>eventId)
        .publish()
        .refCount()

      signal.skip(1)
        .subscribe(r => {
          expect(r).to.be.null
        })

      yield signal.take(1)

      yield EventApi.delete(<any>eventId)
    })

    it('archive event should ok', function* () {
      const mockevent = clone(projectEvents[0])
      const now = Date.now()

      httpBackend.whenGET(`${apihost}events/${mockevent._id}`)
        .respond(JSON.stringify(mockevent))

      httpBackend.whenPOST(`${apihost}events/${mockevent._id}/archive`, {
        occurrenceDate: now
      })
        .respond({
          _id: mockevent._id,
          isArchived: true,
          updated: new Date().toISOString()
        })

      const signal = EventApi.get(<any>mockevent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.archive(<any>mockevent._id, now)

      yield signal.take(1)
        .do(r => {
          expect(r.isArchived).to.be.true
        })
    })

    it('comment repeat event should ok', function* () {
      const mockReapeatEvent = clone(MockRecurrence.commentRepeatResponse.repeat)
      mockReapeatEvent.recurrence = [
        'RRULE:FREQ=DAILY;DTSTART=20160721T020000Z;INTERVAL=1'
      ]
      const comment = {
        action: 'comment',
        _creatorId: 'mockid',
        attachments: [],
        mentions: [],
        timestamp: Date.now()
      }

      httpBackend.whenPOST(`${apihost}events/${mockReapeatEvent._id}/comments_repeat_event`, comment)
        .respond(JSON.stringify(MockRecurrence.commentRepeatResponse))

      httpBackend.whenGET(`${apihost}events/${mockReapeatEvent._id}`)
        .respond(JSON.stringify(mockReapeatEvent))

      const signal = EventApi.get(<any>(mockReapeatEvent._id + '&' + new Date(MockRecurrence.commentRepeatResponse.new.startDate).toISOString()))
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.commentsRepeatEvent(<any>mockReapeatEvent._id, <any>comment)

      yield signal.take(1)
        .do(r => {
          expectDeepEqual(r, MockRecurrence.commentRepeatResponse.new)
        })
    })

    it('likeRepeatEvent should ok', function* () {
      const mockReapeatEvent = clone(MockRecurrence.likeRepeat.repeat)
      mockReapeatEvent.recurrence = [
        'RRULE:FREQ=DAILY;DTSTART=20160721T020000Z;INTERVAL=1'
      ]
      const now = Date.now()

      httpBackend.whenPOST(`${apihost}events/${mockReapeatEvent._id}/like_repeat_event`, {
        occurrenceDate: now
      })
        .respond(JSON.stringify(MockRecurrence.likeRepeat))

      httpBackend.whenGET(`${apihost}events/${mockReapeatEvent._id}`)
        .respond(JSON.stringify(mockReapeatEvent))

      const signal = EventApi.get(<any>(mockReapeatEvent._id + '&' + new Date(MockRecurrence.likeRepeat.new.startDate).toISOString()))
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.likeRepeatEvent(<any>mockReapeatEvent._id, now)

      yield signal.take(1)
        .do(r => {
          expectDeepEqual(r, MockRecurrence.likeRepeat.new)
        })
    })

    it('unarchive should ok', function* () {
      const normalEvent = clone(projectEvents[1])
      normalEvent.isArchived = true

      httpBackend.whenDELETE(`${apihost}events/${normalEvent._id}/archive`)
        .respond({
          _id: normalEvent._id,
          isArchived: false,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      const signal = EventApi.get(<any>normalEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.unarchive(<any>normalEvent._id)

      yield signal.take(1)
        .do(r => {
          expect(r.isArchived).to.be.false
        })
    })

    it('update event content should ok', function* () {
      const normalEvent = clone(projectEvents[1])

      httpBackend.whenPUT(`${apihost}events/${normalEvent._id}/content`, {
        content: 'mock content'
      })
        .respond({
          _id: normalEvent._id,
          content: 'mock content',
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      const signal = EventApi.get(<any>normalEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.updateContent(<any>normalEvent._id, 'mock content')

      yield signal.take(1)
        .do(r => {
          expect(r.content).to.equal('mock content')
        })
    })

    it('updateInvolvemembers should ok', function* () {
      const normalEvent = clone(projectEvents[1])

      httpBackend.whenPUT(`${apihost}events/${normalEvent._id}/involveMembers`, {
        addInvolvers: ['mockinvolve']
      })
        .respond({
          _id: normalEvent._id,
          involveMembers: normalEvent.involveMembers.concat(['mockinvolve']),
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      const signal = EventApi.get(<any>normalEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.updateInvolvemembers(<any>normalEvent._id, {
        addInvolvers: ['mockinvolve']
      })

      yield signal.take(1)
        .do(r => {
          expect(r.involveMembers).to.deep.equal(normalEvent.involveMembers.concat(['mockinvolve']))
        })
    })

    it('updateReminders should ok', function* () {
      const normalEvent = clone(projectEvents[1])
      const reminders = [
        {
          method: 'popup',
          minutes: 0
        }
      ]

      httpBackend.whenPUT(`${apihost}events/${normalEvent._id}/reminders`, { reminders })
        .respond({
          _id: normalEvent._id,
          reminders,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      const signal = EventApi.get(<any>normalEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.updateReminders(<any>normalEvent._id, <any>reminders)

      yield signal.take(1)
        .do(r => {
          expect(r.reminders).to.deep.equal(reminders)
        })
    })

    it('updateTags should ok', function* () {
      const normalEvent = clone(projectEvents[1])
      const tags = ['mocktag1', 'mocktag2']

      httpBackend.whenPUT(`${apihost}events/${normalEvent._id}/tagIds`, {
        tagIds: tags
      })
        .respond({
          _id: normalEvent._id,
          tagIds: tags,
          updated: new Date().toISOString()
        })

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      const signal = EventApi.get(<any>normalEvent._id)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.updateTags(<any>normalEvent._id, <any>tags)

      yield signal.take(1)
        .do(r => {
          expect(r.tagIds).to.deep.equal(tags)
        })
    })
  })

  describe('get project events test: ', () => {
    const projectId = projectEvents[0]._projectId
    const today = new Date(2016, 8, 4)

    let signal: Observable<EventSchema[]>

    beforeEach(() => {
      // http://project.ci/api/projects/56988fb705ead4ae7bb8dcfe/events?startDate=2016-08-04T16%3A00%3A00.000Z
      httpBackend.whenGET(`${apihost}projects/${projectId}/events?startDate=${today.toISOString()}`)
        .respond(JSON.stringify(projectEvents))

      signal = EventApi.getProjectEvents(<any>projectId, today)
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

    it('get project events should ok', done => {
      signal.subscribe(r => {
        expect(r.length).to.equal(31)
        done()
      })
    })

    it('change recurrence date, project events should be notified', function* () {
      const eventId = projectEvents[0]._id
      httpBackend.whenPUT(`${apihost}events/${eventId}`, {
        title: 'new title'
      })
        .respond(JSON.stringify({
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        }))

      yield signal.take(1)

      yield EventApi.update(<any>eventId, {
        title: 'new title'
      })

      yield signal.take(1)
        .do(r => {
          expect(r[0].title).to.equal('new title')
        })
    })

    it('change normal date, project events should be notified', function* () {
      const eventId = projectEvents[1]._id
      httpBackend.whenPUT(`${apihost}events/${eventId}`, {
        title: 'new title'
      })
        .respond(JSON.stringify({
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        }))

      yield signal.take(1)

      yield EventApi.update(<any>eventId, {
        title: 'new title'
      })

      yield signal.take(1)
        .do(r => {
          expect(r[8].title).to.equal('new title')
        })
    })

    it('delete recurrence date, project events should be notified', function* () {
      const eventId = projectEvents[0]._id
        httpBackend.whenDELETE(`${apihost}events/${eventId}`)
          .respond({})

      yield signal.take(1)

      yield EventApi.delete(<any>eventId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(23)
        })
    })

    it('delete normal event should ok', function* () {
      const eventId = projectEvents[1]._id

      httpBackend.whenDELETE(`${apihost}events/${eventId}`)
          .respond({})

      yield signal.take(1)

      yield EventApi.delete(<any>eventId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(30)
        })
    })

    it('add new normal event should ok', function* () {
      const mockPost = {
        _projectId: '569df8b418bfe350733e2461',
        _creatorId: '56986d43542ce1a2798c8cfb',
        title: 'mocktest',
        startDate: '2016-07-21T11:00:00.000Z',
        endDate: '2016-07-21T12:00:00.000Z',
        involveMembers: ['56986d43542ce1a2798c8cfb'],
        visible: 'members'
      }
      const mockEvent = clone(projectEvents[1])
      mockEvent._id = 'mockevent'

      httpBackend.whenPOST(`${apihost}events`, mockPost)
        .respond(JSON.stringify(mockEvent))

      yield signal.take(1)

      yield EventApi.create(<any>mockPost)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(32)
          expectDeepEqual(r[0], mockEvent)
        })
    })

    it('add recurrence event should ok', function* () {
      const mockPost = {
        _projectId: '569df8b418bfe350733e2461',
        _creatorId: '56986d43542ce1a2798c8cfb',
        title: 'mockrecurrencetest',
        startDate: '2016-07-21T11:00:00.000Z',
        endDate: '2016-07-21T12:00:00.000Z',
        involveMembers: ['56986d43542ce1a2798c8cfb'],
        visible: 'members',
        recurrence: MockRecurrence.day.recurrence
      }
      const mockEvent = clone(projectEvents[0])
      mockEvent._id = 'mockrecurrence'
      mockEvent.title = 'mockrecurrencetest'

      httpBackend.whenPOST(`${apihost}events`, mockPost)
        .respond(JSON.stringify(mockEvent))

      yield signal.take(1)

      yield EventApi.create(<any>mockPost)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(39)
          expect(r[0].title).to.equal('mockrecurrencetest')
        })
    })

    it('get event from project events, and update it should ok', function* () {
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
      yield signal.take(1)
        .do(r => {
          events = r
        })

      const eventId = events[0]._id
      const signal2 = EventApi.get(eventId)
        .publish()
        .refCount()

      yield signal2.take(1)

      yield EventApi.commentsRepeatEvent(events[0]._sourceId, <any>comment)

      yield signal2
        .take(1)
        .do(r => {
          expect(r._id).to.equal('mock_new_event')
        })
    })
  })

  describe('get my events test: ', () => {
    const userId = myEvents[0]._creatorId
    const today = new Date(2016, 8, 4)

    let signal: Observable<EventSchema[]>

    beforeEach(() => {
      // http://project.ci/api/events/me?endDate=2016-08-04T16%3A00%3A00.000Z
      httpBackend.whenGET(`${apihost}events/me?endDate=${today.toISOString()}`)
        .respond(JSON.stringify(myEvents))

      signal = EventApi.getMyEvents(<any>userId, today)
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

    it('get my events should ok', done => {
      signal.subscribe(r => {
        expect(r.length).to.equal(41)
        done()
      })
    })

    it('change recurrence date, my events should be notified', function* () {
      const eventId = myEvents[0]._id
      httpBackend.whenPUT(`${apihost}events/${eventId}`, {
        title: 'new title'
      })
        .respond(JSON.stringify({
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        }))

      yield signal.take(1)

      yield EventApi.update(<any>eventId, {
        title: 'new title'
      })

      yield signal.take(1)
        .do(r => {
          expect(r[0].title).to.equal('new title')
        })
    })

    it('change normal date, my events should be notified', function* () {
      const eventId = myEvents[1]._id
      httpBackend.whenPUT(`${apihost}events/${eventId}`, {
        title: 'new title'
      })
        .respond(JSON.stringify({
          _id: eventId,
          title: 'new title',
          updated: new Date().toISOString()
        }))

      yield signal.take(1)

      yield EventApi.update(<any>eventId, {
        title: 'new title'
      })

      yield signal.take(1)
        .do(r => {
          expect(r[8].title).to.equal('new title')
        })
    })

    it('delete recurrence date, my events should be notified', function* () {
      const eventId = myEvents[0]._id
        httpBackend.whenDELETE(`${apihost}events/${eventId}`)
          .respond({})

      yield signal.take(1)

      yield EventApi.delete(<any>eventId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(33)
        })
    })

    it('delete normal event should ok', function* () {
      const eventId = myEvents[1]._id

      httpBackend.whenDELETE(`${apihost}events/${eventId}`)
        .respond({})

      yield signal.take(1)

      yield EventApi.delete(<any>eventId)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(40)
        })
    })

    it('add new normal event should ok', function* () {
      const mockPost = {
        _projectId: '569df8b418bfe350733e2461',
        _creatorId: '56986d43542ce1a2798c8cfb',
        title: 'mocktest',
        startDate: '2016-07-21T11:00:00.000Z',
        endDate: '2016-07-21T12:00:00.000Z',
        involveMembers: ['56986d43542ce1a2798c8cfb'],
        visible: 'members'
      }
      const mockEvent = clone(myEvents[1])
      mockEvent._id = 'mockevent'

      httpBackend.whenPOST(`${apihost}events`, mockPost)
        .respond(JSON.stringify(mockEvent))

      yield signal.take(1)

      yield EventApi.create(<any>mockPost)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(42)
          expectDeepEqual(r[0], mockEvent)
        })
    })

    it('add recurrence event should ok', function* () {
      const mockPost = {
        _projectId: '569df8b418bfe350733e2461',
        _creatorId: '56986d43542ce1a2798c8cfb',
        title: 'mockrecurrencetest',
        startDate: '2016-07-21T11:00:00.000Z',
        endDate: '2016-07-21T12:00:00.000Z',
        involveMembers: ['56986d43542ce1a2798c8cfb'],
        visible: 'members',
        recurrence: MockRecurrence.day.recurrence
      }
      const mockEvent = clone(myEvents[0])
      mockEvent._id = 'mockrecurrence'
      mockEvent.title = 'mockrecurrencetest'

      httpBackend.whenPOST(`${apihost}events`, mockPost)
        .respond(JSON.stringify(mockEvent))

      yield signal.take(1)

      yield EventApi.create(<any>mockPost)

      yield signal.take(1)
        .do(r => {
          expect(r.length).to.equal(49)
          expect(r[0].title).to.equal('mockrecurrencetest')
        })
    })

    it('get event from my events, and update it should ok', function* () {
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
      yield signal.take(1)
        .do(r => {
          events = r
        })

      const eventId = events[0]._id
      const signal2 = EventApi.get(eventId)
        .publish()
        .refCount()

      yield signal.take(1)

      yield EventApi.commentsRepeatEvent(events[0]._sourceId, <any>comment)

      yield signal2.take(1)
        .do(r => {
          expect(r._id).to.equal('mock_new_event')
        })
    })
  })

})
