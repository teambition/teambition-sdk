'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { ActivityData } from '../schemas/Activity'
import {
  DetailObjectId,
  DetailObjectTypes,
  ShareId,
  FileId
} from '../teambition'
import { FileRes } from './FileFetch'

export interface ActivitySaveData {
  content: string
  _id: DetailObjectId
  objectType: DetailObjectTypes
  attachments?: (FileId | FileRes)[]
  voice?: FileId[]
  mentions?: {[key: string]: string}
}

export class ActivityFetch extends BaseFetch {
  fetchAll(
    _boundToObjectType: DetailObjectTypes,
    _boundToObjectId: DetailObjectId,
    query?: any
  ): Observable<ActivityData[]> {
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

  getByShareId(shareId: ShareId, query?: any): Observable<ActivityData[]> {
    return this.fetch.get(`shares/${shareId}/activities`, query)
  }

  addByShareId(shareId: ShareId, data: ActivitySaveData): Observable<ActivityData> {
    const query = this.checkQuery({
      content: data.content,
      attachments: data.attachments,
      voice: data.voice,
      mentions: data.mentions
    })
    return this.fetch.post(`shares/${shareId}/activities`, query)
  }
}

export default new ActivityFetch
