'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { ActivityData } from '../schemas/Activity'

export interface ActivitySaveData {
  content: string
  _id: string
  objectType: string
  attachments?: string[]
  voice?: string[]
  mentions?: string[]
}

export class ActivityFetch extends BaseFetch {
  fetchAll(_boundToObjectType: string, _boundToObjectId: string, query?: any): Observable<ActivityData[]> {
    return this.fetch.get(`${_boundToObjectType}/${_boundToObjectId}/activities`, query)
  }

  add(data: ActivitySaveData): Observable<ActivityData> {
    const query = this.checkQuery({
      content: data.content,
      attachments: data.attachments,
      voice: data.voice,
      mentions: data.mentions
    })
    return this.fetch.post(`${data.objectType}/${data._id}/activities`, query)
  }
}

export default new ActivityFetch()
