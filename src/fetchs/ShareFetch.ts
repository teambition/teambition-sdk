import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { ShareData } from '../schemas/Share'
import { DetailObjectTypes, DetailObjectId, ShareId } from '../teambition'

export class ShareFetch extends BaseFetch {

  get(
    objectType: DetailObjectTypes,
    objectId: DetailObjectId,
    shareId: ShareId,
    query?: any
  ): Observable<ShareData> {
    return this.fetch.get(`${objectType}/${objectId}/shares/${shareId}`, query)
  }
}

export default new ShareFetch
