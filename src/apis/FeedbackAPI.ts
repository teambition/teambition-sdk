'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { FeedbackData } from '../schemas/Feedback'
import {
  default as FeedbackFetch,
  CreateProjectFeedbackOption,
  GetProjectFeedbackQuerys,
  UpdateProjectFeedbackOptions,
  UpdateProjectFeedbackResponse
} from '../fetchs/FeedbackFetch'
import FeedbackModel from '../models/FeedbackModel'
import { observableError, errorHandler, makeColdSignal } from './utils'

export class FeedbackAPI {

  create(_projectId: string, option: CreateProjectFeedbackOption): Observable<FeedbackData> {
    return Observable.create((observer: Observer<FeedbackData>) => {
      Observable.fromPromise(FeedbackFetch.createProjectFeedback(_projectId, option))
        .catch(err => observableError(observer, err))
        .concatMap(r => FeedbackModel.addOne(r).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  getProjectFeedback(projectId: string, query: GetProjectFeedbackQuerys): Observable<FeedbackData[]> {
    return makeColdSignal<FeedbackData[]>(observer => {
      const cache = FeedbackModel.getProjectFeedbacks(projectId, query.page, query.from, query.to)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(FeedbackFetch.getProjectFeedback(projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => FeedbackModel.addProjectFeedbacks(projectId, r, query.page, query.count, query.from, query.to))
    })
  }

  deleteProjectFeedback(_projectId: string, feedbackId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(FeedbackFetch.deleteProjectFeedback(_projectId, feedbackId))
        .catch(err => observableError(observer, err))
        .concatMap(r => FeedbackModel.delete(feedbackId))
        .forEach(() => observer.next(null))
        .then(() => observer.complete())
    })
  }

  updateProjectFeedback(_projectId: string, feedbackId: string, options: UpdateProjectFeedbackOptions): Observable<UpdateProjectFeedbackResponse> {
    return Observable.create((observer: Observer<UpdateProjectFeedbackResponse>) => {
      Observable.fromPromise(FeedbackFetch.updateProjectFeedback(_projectId, feedbackId, options))
        .catch(err => observableError(observer, err))
        .concatMap(r => FeedbackModel.update(feedbackId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
