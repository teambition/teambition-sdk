'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Tasklist from '../schemas/Tasklist'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class TasklistModel extends BaseModel {
  private _schemaName = 'Tasklist'

  addTasklists(_projectId: string, tasklists: Tasklist[]): Observable<Tasklist[]> {
    const result = datasToSchemas<Tasklist>(tasklists, Tasklist)
    return this._saveCollection(`project:tasklists/${_projectId}`, result, this._schemaName, (data: Tasklist) => {
      return !data.isArchived && data._projectId === _projectId
    })
  }

  getTasklists(_projectId: string): Observable<Tasklist[]> {
    return this._get<Tasklist[]>(`project:tasklists/${_projectId}`)
  }

  add(tasklist: Tasklist): Observable<Tasklist> {
    const result = dataToSchema<Tasklist>(tasklist, Tasklist)
    return this._save<Tasklist>(result)
  }

  get(tasklistId: string): Observable<Tasklist> {
    return this._get<Tasklist>(tasklistId)
  }
}

export default new TasklistModel()
