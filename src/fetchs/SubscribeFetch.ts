'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { assign } from '../utils'
import { SubscribeData } from '../schemas/Subscribe'

export interface UpdateOrgsSubscribeResponse {
  _id: string
  body: {
    projects: string[]
  }
}

export class SubscribeFetch extends BaseFetch {
  getOrgsSubscribe(_organizationId: string, query?: any): Observable<SubscribeData> {
    const _query = {
      _organizationId
    }
    if (query) {
      assign(_query, query)
    }
    return this.fetch.get(`subscribers/report`, _query)
  }

  updateOrgsSubscribe(_organizationId: string, $add?: string[], $del?: string[]): Observable<UpdateOrgsSubscribeResponse> {
    const body = Object.create(null)
    if ($add) {
      body.$add = {
        'body.projects': $add
      }
    }
    if ($del) {
      body.$del = {
        'body.projects': $del
      }
    }
    return this.fetch.put(`subscribers/report?_organizationId=${_organizationId}`, body)
  }
}

export default new SubscribeFetch()
