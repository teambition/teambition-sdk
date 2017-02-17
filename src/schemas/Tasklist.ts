import { SchemaDef, RDBType, Association } from 'reactivedb'
import { schemas } from '../SDK'
import { StageData } from '../schemas/Stage'
import { TasklistId, StageId, ProjectId, UserId } from 'teambition-types'

export interface TasklistData {
  _id: TasklistId
  title: string
  _projectId: ProjectId
  _creatorId: UserId
  description: string
  isArchived: boolean
  created: string
  updated: string
  stageIds: StageId[]
  doneCount: number
  undoneCount: number
  expiredCount: number
  recentCount: number
  totalCount: number
  hasStages: StageData[]
}

const schema: SchemaDef<TasklistData> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
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
    type: Association.oneToOne,
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
  recentCount: {
    type: RDBType.NUMBER
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

schemas.push({ name: 'Tasklist', schema })
