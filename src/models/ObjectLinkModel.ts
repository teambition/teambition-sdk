'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import ObjectLinkSchema, { ObjectLinkData } from '../schemas/ObjectLink'
import { dataToSchema, datasToSchemas } from '../utils/index'
import { DetailObjectId } from '../teambition'

export class ObjectLinkModel extends Model {
  private _schemaName = 'ObjectLink'

  addOne(objectLink: ObjectLinkData): Observable<ObjectLinkData> {
    const result = dataToSchema<ObjectLinkData>(objectLink, ObjectLinkSchema)
    return this._save<ObjectLinkData>(result)
  }

  addObjectLinks(parentId: DetailObjectId, objectLinks: ObjectLinkData[]): Observable<ObjectLinkData[]> {
    const result = datasToSchemas<ObjectLinkData>(objectLinks, ObjectLinkSchema)
    return this._saveCollection(`objectLink/${parentId}`, result, this._schemaName, (data: ObjectLinkData) => {
      return data._parentId === parentId
    })
  }

  getObjectLinks(parentId: DetailObjectId): Observable<ObjectLinkData[]> {
    return this._get<ObjectLinkData[]>(`objectLink/${parentId}`)
  }
}

export default new ObjectLinkModel
