'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { TasklistData, default as Tasklist } from '../schemas/Tasklist'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { TasklistId, ProjectId } from '../teambition'

export class TasklistModel extends BaseModel {
  private _schemaName = 'Tasklist'

  addTasklists(_projectId: ProjectId, tasklists: TasklistData[]): Observable<TasklistData[]> {
    const result = datasToSchemas<TasklistData>(tasklists, Tasklist)
    return this._saveCollection(`project:tasklists/${_projectId}`, result, this._schemaName, (data: TasklistData) => {
      return !data.isArchived && data._projectId === _projectId
    })
  }

  getTasklists(_projectId: ProjectId): Observable<TasklistData[]> {
    return this._get<TasklistData[]>(`project:tasklists/${_projectId}`)
  }

  addOne(tasklist: TasklistData): Observable<TasklistData> {
    const result = dataToSchema<TasklistData>(tasklist, Tasklist)
    return this._save<TasklistData>(result)
  }

  getOne(tasklistId: TasklistId): Observable<TasklistData> {
    return this._get<TasklistData>(<any>tasklistId)
  }
}

export default new TasklistModel
