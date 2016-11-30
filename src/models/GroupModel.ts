import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { GroupData, default as Group } from '../schemas/Group'
import { dataToSchema, datasToSchemas } from '../utils/index'
import Collection from './BaseCollection'
import { GroupId, OrganizationId, UserId } from '../teambition'

export class GroupModel extends BaseModel {

  private _schemaName = 'Group'

  addOne(group: GroupData) {
    const result = dataToSchema<GroupData>(group, Group)
    return this._save(result)
  }

  getOne(groupId: GroupId) {
    return this._get<GroupData>(<any>groupId)
  }

  addByOrganizationId(organizationId: OrganizationId, groups: GroupData[], page: number): Observable<GroupData[]> {
    const dbIndex = `organization:groups/${organizationId}`
    const result = datasToSchemas(groups, Group)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: GroupData) => {
          return data._organizationId === organizationId
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByOrganizationId(organizationId: OrganizationId, page: number): Observable<GroupData[]> {
    const dbIndex = `organization:groups/${organizationId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addByUserId(userId: UserId, groups: GroupData[], page: number): Observable<GroupData[]> {
    const dbIndex = `user:groups/${userId}`
    const result = datasToSchemas(groups, Group)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: GroupData) => {
          return data.hasMembers
            .map(user => user._id)
            .indexOf(userId) !== -1
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByUserId(userId: UserId, page: number): Observable<GroupData[]> {
    const dbIndex = `user:groups/${userId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new GroupModel
