import { Observable } from 'rxjs/Observable'
import { ProjectId, CustomFieldBoundType } from '../teambition'
import CustomFieldLinkFetch from '../fetchs/CustomFieldLinkFetch'
import CustomFieldLinkModel from '../models/CustomFieldLinkModel'
import { CustomFieldLinkData } from '../schemas/CustomFieldLink'
import { makeColdSignal } from './utils'

export class CustomFieldLinkAPI {

  getProjectCustomFieldLinks(projectId: ProjectId, boundType: CustomFieldBoundType): Observable<CustomFieldLinkData[]> {
    return makeColdSignal(() => {
      const cache = CustomFieldLinkModel.getProjectCustomFieldLinks(projectId, boundType)
      if (cache) return cache
      return CustomFieldLinkFetch.getProjectCustomFieldLinks(projectId, boundType)
        .concatMap((links) => {
          return CustomFieldLinkModel.saveProjectCustomFieldLinks(projectId, boundType, links)
        })
    })
  }
}

export default new CustomFieldLinkAPI()
