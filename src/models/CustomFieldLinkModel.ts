import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { CustomFieldLinkData } from '../schemas/CustomFieldLink'
import CustomFieldLink from '../schemas/CustomFieldLink'
import { ProjectId, CustomFieldBoundType } from '../teambition'
import { datasToSchemas } from '../utils'

export class CustomFieldLinkModel extends BaseModel {
  private _schemaName = 'CustomFieldLink'

  saveProjectCustomFieldLinks(projectId: ProjectId, boundType: CustomFieldBoundType, customFieldLinks: CustomFieldLinkData[]) {
    const index = `customfieldlinks:${boundType}/${projectId}`
    return this._saveCollection(
      index,
      datasToSchemas(customFieldLinks, CustomFieldLink),
      this._schemaName,
      (link) => {
        return link._projectId === projectId
          && link.boundType === boundType
      }
    )
  }

  getProjectCustomFieldLinks(projectId: ProjectId, boundType: CustomFieldBoundType): Observable<CustomFieldLinkData[]> {
    const index = `customfieldlinks:${boundType}/${projectId}`
    return this._get<CustomFieldLinkData[]>(index)
  }
}

export default new CustomFieldLinkModel()
