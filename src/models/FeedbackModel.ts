'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import Collection from './BaseCollection'
import FeedbackSchema, { FeedbackData } from '../schemas/Feedback'
import { dataToSchema, datasToSchemas } from '../utils'

export class FeedbackModel extends Model {

  private _schemaName = 'Feedback'

  addOne(data: FeedbackData): Observable<FeedbackData> {
    const result = dataToSchema(data, FeedbackSchema)
    return this._save(result)
  }

  getOne(feedbackId: string): Observable<FeedbackData> {
    return this._get<FeedbackData>(feedbackId)
  }

  addProjectFeedbacks(projectId: string, feedbacks: FeedbackData[], page = 1, count = 100, from: string, to: string): Observable<FeedbackData[]> {
    const result = datasToSchemas(feedbacks, FeedbackSchema)
    const dbIndex = `project:feedbacks:${from}:${to}/${projectId}`

    let cache: Collection<FeedbackData> = this._collections.get(dbIndex)
    if (!cache) {
      cache = new Collection(this._schemaName, (data: FeedbackData) => {
        const created = new Date(data.created)
        return data.boundToObjectType === 'project' &&
          data._boundToObjectId === projectId &&
          created >= new Date(from) &&
          created < new Date(to)
      }, dbIndex, count)
      this._collections.set(dbIndex, cache)
    }
    return cache.addPage(page, result)
  }

  getProjectFeedbacks(projectId: string, page: number, from: string, to: string) {
    const collection = this._collections.get(`project:feedbacks:${from}:${to}/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new FeedbackModel()
