'use strict'
import { Observable } from 'rxjs/Observable'
import { TaskData } from '../../schemas/Task'
import { SubtaskData } from '../../schemas/Subtask'
import Collection from '../BaseCollection'
import { ISchema } from '../../schemas/schema'

export default class MaxIdCollection<T extends ISchema<SubtaskData | TaskData>> extends Collection<SubtaskData | TaskData> {
  public maxId: string

 maxAddPage(page: number, data: T[]): Observable<any[]> {
    const result = super.addPage(page, <any[]>data)
    const maxPageData = data
      .sort((a: any, b: any) => new Date(b.created).valueOf() - new Date(a.created).valueOf())
    this.maxId = maxPageData[maxPageData.length - 1]['_id']
    return result
  }
}
