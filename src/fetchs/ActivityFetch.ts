'use strict'
import BaseFetch from './BaseFetch'
import Activity from '../schemas/Activity'

export interface ActivitySaveData {
  content: string
  _id: string
  objectType: string
  attachments?: string[]
  voice?: string[]
  mentions?: string[]
}

export class ActivityFetch extends BaseFetch {
  fetchAll(_boundToObjectId: string, query?: any): Promise<Activity[]> {
    query = query ? query : Object.create(null)
    query._boundToObjectId = _boundToObjectId
    return this.fetch.get(`activities`, query)
  }

  add(data: ActivitySaveData): Promise<Activity> {
    const query = this.checkQuery({
      content: data.content,
      attachments: data.attachments,
      voice: data.voice,
      mentions: data.mentions
    })
    return this.fetch.post(`${data.objectType}/${data._id}/activities`, query)
  }
}
