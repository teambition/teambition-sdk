import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { ProjectStatusActivityId, ProjectStatusDegree, UserSnippet } from 'teambition-types'

export interface ProjectStatusActivitySchema {
  _boundToObjectId: string
  _id: ProjectStatusActivityId
  action: string
  boundToObjectType: string
  canRecall: boolean
  content: { content: string; degree: ProjectStatusDegree }
  created: string
  creator: UserSnippet
  isDeleted: boolean
  isDirectMessage: boolean
  isGuest: boolean
  isHomeActivity: boolean
  isRecalledDirectMessage: boolean
  source: string
  updated: string
}

const schema: SchemaDef<ProjectStatusActivitySchema> = {
  _boundToObjectId: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  action: { type: RDBType.STRING },
  boundToObjectType: { type: RDBType.STRING },
  canRecall: { type: RDBType.BOOLEAN },
  content: { type: RDBType.OBJECT },
  created: { type: RDBType.DATE_TIME },
  creator: { type: RDBType.STRING },
  isDeleted: { type: RDBType.BOOLEAN },
  isDirectMessage: { type: RDBType.BOOLEAN },
  isGuest: { type: RDBType.BOOLEAN },
  isHomeActivity: { type: RDBType.BOOLEAN },
  isRecalledDirectMessage: { type: RDBType.BOOLEAN },
  source: { type: RDBType.STRING },
  updated: { type: RDBType.DATE_TIME }
}

schemaColl.add({ schema, name: 'ProjectStatusActivity' })
