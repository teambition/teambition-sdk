import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { CustomFieldBoundType, ProjectId } from '../app'
import { CustomFieldLinkData } from '../schemas/CustomFieldLink'

export class CustomFieldLinkFetch extends BaseFetch {

  getProjectCustomFieldLinks(projectId: ProjectId, boundType: CustomFieldBoundType): Observable<CustomFieldLinkData[]> {
    return this.fetch.get<CustomFieldLinkData[]>(
      `projects/${projectId}/customfieldlinks?boundType=${boundType}`
    )
  }
}

export default new CustomFieldLinkFetch()
