'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { CustomFieldData, default as CustomFieldSchema } from '../schemas/CustomField'
import { datasToSchemas } from '../utils/index'
import { ProjectId } from '../teambition'

export class CustomFieldModel extends BaseModel {

  private _schemaName = 'CustomField'

  addCustomFields(projectId: ProjectId, customFields: CustomFieldData[]): Observable<CustomFieldData[]> {
    const result = datasToSchemas<CustomFieldData>(customFields, CustomFieldSchema)
    return this._saveCollection(`projects:${projectId}/customfiedls`, result, this._schemaName, (data: CustomFieldData) => {
      return data._projectId === projectId
    })
  }

  getCustomFields(projectId: ProjectId): Observable<CustomFieldData[]> {
    return this._get<CustomFieldData[]>(`projects:${projectId}/customfiedls`)
  }
}

export default new CustomFieldModel
