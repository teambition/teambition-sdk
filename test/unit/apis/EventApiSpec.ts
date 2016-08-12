'use strict'
import * as chai from 'chai'
import * as moment from 'moment'
import { Scheduler } from 'rxjs'
import {
  apihost,
  Backend,
  EventAPI,
  RecurrenceEvent,
  clone
} from '../index'
import { flush, expectDeepEqual } from '../utils'
import * as MockRecurrence from '../../mock/recurrenceEvents'
import { projectEvents } from '../../mock/projectEvents'

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
      const Recurrence = new RecurrenceEvent(day)
      const next = Recurrence.next()
      // 相差一天
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(day.startDate).add(1, 'day').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(day.endDate).add(1, 'day').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by week should ok', () => {
      const week = MockRecurrence.week
      const Recurrence = new RecurrenceEvent(week)
      const next = Recurrence.next()
      // 相差一周
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(week.startDate).add(1, 'week').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(week.endDate).add(1, 'week').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by month should ok', () => {
      const month = MockRecurrence.month
      const Recurrence = new RecurrenceEvent(month)
      const next = Recurrence.next()
      // 相差一个月
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(month.startDate).add(1, 'month').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(month.endDate).add(1, 'month').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by year should ok', () => {
      const year = MockRecurrence.year
      const Recurrence = new RecurrenceEvent(year)
      const next = Recurrence.next()
      // 相差一年
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(year.startDate).add(1, 'year').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(year.endDate).add(1, 'year').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by customer day should ok', () => {
      const customerday = MockRecurrence.customerday
      const Recurrence = new RecurrenceEvent(customerday)
      const next = Recurrence.next()
      // 相差 3 天
      expect(moment(next.value.startDate).valueOf()).to.equal(moment(customerday.startDate).add(3, 'day').valueOf())
      expect(moment(next.value.endDate).valueOf()).to.equal(moment(customerday.endDate).add(3, 'day').valueOf())
      expect(Recurrence.take(5).length).to.equal(5)
      expect(next.done).to.be.false
    })

    it('recurrence by customer week should ok', () => {
      const customerweek = MockRecurrence.customerweek
      const Recurrence = new RecurrenceEvent(customerweek)
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
      const Recurrence = new RecurrenceEvent(customermonth)

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
      const Recurrence = new RecurrenceEvent(day)

      const result = Recurrence.takeUntilTime(new Date(moment(day.startDate).add(5, 'day').add(1, 'hour')))
      expect(result.length).to.equal(6)
    })

    it('takeByTime should ok', () => {
      const day = MockRecurrence.day
      const Recurrence = new RecurrenceEvent(day)

      const result = Recurrence.takeByTime(new Date(moment(day.startDate).add(5, 'day')))
      expect(result.startDate).to.equal(moment(day.startDate).add(5, 'day').toISOString())
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

      EventApi.create(mockPost)
        .subscribe(r => {
          expect(r.recurrence).to.deep.equal(MockRecurrence.day.recurrence)
          done()
        }, err => console.error(err))

      httpBackend.flush()
    })

    it('get event should ok', done => {
      const mockEvent = projectEvents[1]

      httpBackend.whenGET(`${apihost}events/${mockEvent._id}`)
        .respond(JSON.stringify(mockEvent))

      EventApi.get(mockEvent._id)
        .subscribe(r => {
          expectDeepEqual(mockEvent, r)
          done()
        })

      httpBackend.flush()
    })

    it('update title should ok', done => {
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

      EventApi.get(mockEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.title).to.equal('new title')
          done()
        })

      EventApi.update(mockEvent._id, {
        title: 'new title'
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('update recurrence should ok', done => {
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

      EventApi.get(mockEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.content).to.equal(mockEvent.content)
          done()
        })

      EventApi.update(mockEvent._id, {
        recurrence: ['RRULE:FREQ=WEEKLY;DTSTART=20160801T030000Z;INTERVAL=1']
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('delete event should ok', done => {
      const eventId = projectEvents[0]._id

      httpBackend.whenGET(`${apihost}events/${eventId}`)
        .respond(JSON.stringify(projectEvents[0]))

      httpBackend.whenDELETE(`${apihost}events/${eventId}`)
        .respond(null)

      EventApi.get(eventId)
        .skip(1)
        .subscribe(r => {
          expect(r).to.be.null
          done()
        })

      EventApi.delete(eventId)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('archive event should ok', done => {
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

      EventApi.get(mockevent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.isArchived).to.be.true
          done()
        })

      EventApi.archive(mockevent._id, now)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('comment repeat event should ok', done => {
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

      EventApi.get(mockReapeatEvent._id + '&' + new Date(MockRecurrence.commentRepeatResponse.new.startDate).toISOString())
        .skip(1)
        .subscribe(r => {
          expectDeepEqual(r, MockRecurrence.commentRepeatResponse.new)
          done()
        })

      EventApi.commentsRepeatEvent(mockReapeatEvent._id, <any>comment)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('like event should ok', done => {
      const normalEvent = projectEvents[1]
      const likeResponse = {
        isLike: true,
        likesCount: 1,
        likesGroup: [
          {
            _id: 'mockid',
            avatarUrl: 'mockurl',
            name: 'mockName'
          }
        ]
      }
      httpBackend.whenPOST(`${apihost}events/${normalEvent._id}/like`)
        .respond(JSON.stringify(likeResponse))

      httpBackend.whenGET(`${apihost}events/${normalEvent._id}`)
        .respond(JSON.stringify(normalEvent))

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.isLike).to.be.true
          expect(r.likesGroup).to.deep.equal(likeResponse.likesGroup)
          expect(r.likesCount).to.equal(1)
          done()
        })

      EventApi.like(normalEvent._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('likeRepeatEvent should ok', done => {
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

      EventApi.get(mockReapeatEvent._id + '&' + new Date(MockRecurrence.likeRepeat.new.startDate).toISOString())
        .skip(1)
        .subscribe(r => {
          expectDeepEqual(r, MockRecurrence.likeRepeat.new)
          done()
        })

      EventApi.likeRepeatEvent(mockReapeatEvent._id, now)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('unarchive should ok', done => {
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

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.isArchived).to.be.false
          done()
        })

      EventApi.unarchive(normalEvent._id)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('update event content should ok', done => {
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

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.content).to.equal('mock content')
          done()
        })

      EventApi.updateContent(normalEvent._id, 'mock content')
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('updateInvolvemembers should ok', done => {
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

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.involveMembers).to.deep.equal(normalEvent.involveMembers.concat(['mockinvolve']))
          done()
        })

      EventApi.updateInvolvemembers(normalEvent._id, {
        addInvolvers: ['mockinvolve']
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('updateReminders should ok', done => {
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

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.reminders).to.deep.equal(reminders)
          done()
        })

      EventApi.updateReminders(normalEvent._id, <any>reminders)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })

    it('updateTags should ok', done => {
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

      EventApi.get(normalEvent._id)
        .skip(1)
        .subscribe(r => {
          expect(r.tagIds).to.deep.equal(tags)
          done()
        })

      EventApi.updateTags(normalEvent._id, tags)
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

      httpBackend.flush()
    })
  })

})
