'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { UserMe } from '../schemas/UserMe'
import { UserId, TaskId } from '../teambition'

export interface SimpleUser {
  _id: UserId
  avatarUrl: string
  name: string
  email?: string
  title?: string
  pinyin?: string
  py?: string
}

export class UserFetch extends BaseFetch {

  getUserMe(): Observable<UserMe> {
    return this.fetch.get(`users/me`)
  }

  update(patch: any): Observable<any> {
    return this.fetch.put('users', patch)
  }

  addEmail(email: string): Observable<any[]> {
    return this.fetch.post('users/email', {
      email: email
    })
  }

  bindPhone(phone: string, vcode: string): Observable<void> {
    return this.fetch.put<void>('users/phone', {
      phone: phone,
      vcode: vcode
    })
  }

  getRecentUsers(): Observable<SimpleUser[]> {
    return this.fetch.get('rooms/recent-users', {
      isWithInbox: true
    })
  }

  getRecommendedUsers(): Observable<SimpleUser[]> {
    return this.fetch.get('rooms/recommend-users', {
      isWithInbox: true
    })
  }

  getFreeTaskFollowers(taskId: TaskId, query?: any): Observable<SimpleUser[]> {
    return this.fetch.get(`tasks/${taskId}/inbox/involvers`, query)
  }
}

export default new UserFetch
