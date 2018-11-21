import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { StageSchema } from '../schemas/Stage'
import { TasklistId, TaskSortMethod, ScenarioFieldConfigId, StageId, ProjectId, UserId } from 'teambition-types'

export interface TasklistSchema {
  _id: TasklistId
  _creatorId: UserId
  _defaultScenariofieldconfigId: ScenarioFieldConfigId | null
  _projectId: ProjectId
  created: string
  description: string
  doneCount: number
  expiredCount: number
  isArchived: boolean
  isLocked: boolean
  hasStages: StageSchema[]
  pos: number
  recentCount: number
  sortMethod: TaskSortMethod | ''
  stageIds: StageId[]
  title: string
  totalCount: number
  undoneCount: number
  updated: string
}

const schema: SchemaDef<TasklistSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _defaultScenariofieldconfigId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.STRING
  },
  doneCount: {
    type: RDBType.NUMBER
  },
  expiredCount: {
    type: RDBType.NUMBER
  },
  hasStages: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Stage',
      where: (stageTable: any) => ({
        _id: stageTable._tasklistId
      })
    }
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isLocked: {
    type: RDBType.BOOLEAN
  },
  pos: {
    type: RDBType.NUMBER
  },
  recentCount: {
    type: RDBType.NUMBER
  },
  sortMethod: {
    type: RDBType.STRING
  },
  stageIds: {
    type: RDBType.LITERAL_ARRAY
  },
  title: {
    type: RDBType.STRING
  },
  totalCount: {
    type: RDBType.NUMBER
  },
  undoneCount: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.NUMBER
  }
}

schemaColl.add({ name: 'Tasklist', schema })
