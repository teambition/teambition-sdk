'use strict'
import { Observable } from 'rxjs/Observable'
import { FeedbackData } from '../schemas/Feedback'
import {
  default as FeedbackFetch,
  CreateProjectFeedbackOption,
  GetProjectFeedbackQuerys,
  UpdateProjectFeedbackOptions,
  UpdateProjectFeedbackResponse
} from '../fetchs/FeedbackFetch'
import FeedbackModel from '../models/FeedbackModel'
import { makeColdSignal } from './utils'

export class FeedbackAPI {

  create(_projectId: string, option: CreateProjectFeedbackOption): Observable<FeedbackData> {
    return FeedbackFetch.createProjectFeedback(_projectId, option)
      .concatMap(r => FeedbackModel.addOne(r).take(1))
  }

  getProjectFeedback(projectId: string, query: GetProjectFeedbackQuerys): Observable<FeedbackData[]> {
    return makeColdSignal<FeedbackData[]>(() => {
      const cache = FeedbackModel.getProjectFeedbacks(projectId, query.page, query.from, query.to)
      if (cache) {
        return cache
      }
      return FeedbackFetch.getProjectFeedback(projectId, query)
        .concatMap(r => FeedbackModel.addProjectFeedbacks(projectId, r, query.page, query.count, query.from, query.to))
    })
  }

  deleteProjectFeedback(_projectId: string, feedbackId: string): Observable<void> {
    return FeedbackFetch.deleteProjectFeedback(_projectId, feedbackId)
      .concatMap(r => FeedbackModel.delete(feedbackId))
  }

  updateProjectFeedback(_projectId: string, feedbackId: string, options: UpdateProjectFeedbackOptions): Observable<UpdateProjectFeedbackResponse> {
    return FeedbackFetch.updateProjectFeedback(_projectId, feedbackId, options)
      .concatMap(r => FeedbackModel.update(feedbackId, r))
  }
}

export default new FeedbackAPI
