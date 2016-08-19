'use strict'
import BaseFetch from './BaseFetch'
import { assign } from '../utils'

export interface GetOrgsSubscribeResponse {
  _id: string
  _userId: string
  type: 'report'
  body: {
    projects: {
      _id: string
      name: string
      logo: string
      py: string
      pinyin: string
    }[]
    users: {
      _id: string
      avatarUrl: string
      name: string
      pinyin: string
      py: string
    }[]
    _boundToObjectId: string
  }
  updated: string
  created: string
  name: string
}

export interface UpdateOrgsSubscribeResponse {
  _id: string
  body: {
    projects: string[]
  }
}

export class SubscribeFetch extends BaseFetch {
  getOrgsSubscribe(_organizationId: string, query?: any): Promise<GetOrgsSubscribeResponse> {
    const _query = {
      _organizationId
    }
    if (query) {
      assign(_query, query)
    }
    return this.fetch.get(`subscribers/report`, _query)
  }

  updateOrgsSubscribe(_organizationId: string, $add?: string[], $del?: string[]): Promise<UpdateOrgsSubscribeResponse> {
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
