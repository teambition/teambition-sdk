'use strict'
import { Observable } from 'rxjs'
import { TaskData } from '../../schemas/Task'
import { SubtaskData } from '../../schemas/Subtask'
import Collection from '../BaseCollection'
import { ISchema } from '../../schemas/schema'

export default class MaxIdCollection<T extends ISchema<SubtaskData | TaskData>> extends Collection<SubtaskData | TaskData> {
  public maxId: string

 maxAddPage(page: number, data: T[]): Observable<any[]> {
    const result = super.addPage(page, <any[]>data)
    const maxPage = this._pages[this._pages.length - 1]
    const maxPageData = this._data.get(maxPage)
      .sort((a, b) => new Date(b.created).valueOf() - new Date(a.created).valueOf())
    this.maxId = maxPageData[maxPageData.length - 1]._id
    return result
  }
}
