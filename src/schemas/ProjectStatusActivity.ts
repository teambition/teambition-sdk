import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { UserId, ProjectStatusActivityId, ProjectDegree } from 'teambition-types'

export interface ProjectStatusActivitySchema {
  creator: {
    avatarUrl: string
    _id: UserId
    name: string
  },
  _id: ProjectStatusActivityId
  action: string
  boundToObjects: Array<{
    objectType: string
    _id: string
    _objectId: string
  }>
  canRecall: boolean
  content: {
    content: string
    degree: ProjectDegree
  }
  created: string
  isDeleted: boolean
  isDirectMessage: boolean
  isGuest: boolean
  isHomeActivity: boolean
  isRecalledDirectMessage: boolean
  source: string
  updated: string
}

const schema: SchemaDef<ProjectStatusActivitySchema> = {
  creator: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  action: { type: RDBType.STRING },
  boundToObjects: { type: RDBType.OBJECT },
  canRecall: { type: RDBType.BOOLEAN },
  content: { type: RDBType.OBJECT },
  created: { type: RDBType.DATE_TIME },
  isDeleted: { type: RDBType.BOOLEAN },
  isDirectMessage: { type: RDBType.BOOLEAN },
  isGuest: { type: RDBType.BOOLEAN },
  isHomeActivity: { type: RDBType.BOOLEAN },
  isRecalledDirectMessage: { type: RDBType.BOOLEAN },
  source: { type: RDBType.STRING },
  updated: { type: RDBType.DATE_TIME },
}

schemaColl.add({ schema, name: 'ProjectStatusActivity' })
