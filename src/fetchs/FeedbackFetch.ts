'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { FeedbackData } from '../schemas/Feedback'

export interface GetProjectFeedbackQuerys {
  // ISOString
  from: string
  // ISOString
  to: string
  count?: number
  page?: number
  _creatorIds?: string[]
  [index: string]: any
}

export interface CreateProjectFeedbackOption {
  content: string
}

export interface UpdateProjectFeedbackOptions {
  comment: string
}

export interface UpdateProjectFeedbackResponse {
  content: {
    comment: string
  }
}

export class FeedbackFetch extends BaseFetch {
  getProjectFeedback(projectId: string, query: GetProjectFeedbackQuerys): Observable<FeedbackData[]> {
    return this.fetch.get(`projects/${projectId}/feedbacks`, query)
  }

  createProjectFeedback(_projectId: string, options: CreateProjectFeedbackOption): Observable<FeedbackData> {
    return this.fetch.post(`projects/${_projectId}/feedbacks`, options)
  }

  deleteProjectFeedback(_projectId: string, feedbackId: string): Observable<void> {
    return this.fetch.delete<void>(`projects/${_projectId}/feedbacks/${feedbackId}`)
  }

  updateProjectFeedback(_projectId: string, feedbackId: string, options: UpdateProjectFeedbackOptions): Observable<UpdateProjectFeedbackResponse> {
    return this.fetch.put(`projects/${_projectId}/feedbacks/${feedbackId}`, options)
  }
}

export default new FeedbackFetch()
