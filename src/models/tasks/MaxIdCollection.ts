'use strict'
import { Observable } from 'rxjs/Observable'
import { TaskData } from '../../schemas/Task'
import { SubtaskData } from '../../schemas/Subtask'
import Collection from '../BaseCollection'
import { ISchema, Schema } from '../../schemas/schema'

export default class MaxIdCollection<T extends ISchema> extends Collection<SubtaskData | TaskData> {
  public maxId: number

 maxAddPage(page: number, data: Schema<T>[]): Observable<any[]> {
    const result = super.addPage(page, <any[]>data)
    const maxPageData = data
      .sort((a: any, b: any) => new Date(b.created).valueOf() - new Date(a.created).valueOf())
    if (maxPageData.length) {
      this.maxId = maxPageData[maxPageData.length - 1]['_id']
    }
    return result
  }
}
