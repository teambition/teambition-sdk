import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { GroupData } from '../schemas/Group'
import { GroupId, OrganizationId } from '../teambition'

export class GroupFetch extends BaseFetch {

  get(groupId: GroupId, query?: any): Observable<GroupData> {
    return this.fetch.get(`groups/${groupId}`, query)
  }

  getByOrganizationId(organizationId: OrganizationId, query?: any): Observable<GroupData[]> {
    return this.fetch.get(`organizations/${organizationId}/groups`, query)
  }

  getByMe(query?: any): Observable<GroupData[]> {
    return this.fetch.get(`groups/me`, query)
  }
}

export default new GroupFetch
