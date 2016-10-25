'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { assign } from '../utils'
import { SubscribeData } from '../schemas/Subscribe'
import { SubscribeId, OrganizationId, ProjectId } from '../teambition'

export interface UpdateOrgsSubscribeResponse {
  _id: SubscribeId
  body: {
    projects: ProjectId[]
  }
}

export class SubscribeFetch extends BaseFetch {
  getOrgsSubscribe(_organizationId: OrganizationId, query?: any): Observable<SubscribeData> {
    const _query = {
      _organizationId
    }
    if (query) {
      assign(_query, query)
    }
    return this.fetch.get(`subscribers/report`, _query)
  }

  updateOrgsSubscribe(
    _organizationId: OrganizationId,
    $add?: ProjectId[],
    $del?: ProjectId[]
  ): Observable<UpdateOrgsSubscribeResponse> {
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

export default new SubscribeFetch
