'use strict'
import { Observable } from 'rxjs'
import Task from '../../schemas/Task'
import Subtask from '../../schemas/Subtask'
import Collection from '../BaseCollection'

export default class MaxIdCollection<T extends (Task | Subtask)> extends Collection<T> {
  public maxId: string

  addPage(page: number, data: T[]): Observable<T[]> {
    const result = super.addPage(page, data)
    const maxPage = this._pages[this._pages.length - 1]
    const maxPageData = this._data.get(maxPage)
      .sort((a, b) => new Date(b.created).valueOf() - new Date(a.created).valueOf())
    this.maxId = maxPageData[maxPageData.length - 1]._id
    return result
  }
}
