import { ProjectReminderId, ProjectId, UserId } from 'teambition-types'

import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { TaskReminderReceiverBaseOnRole } from './TaskReminder'

export interface ProjectReminderSchema {
  _id: ProjectReminderId
  _creatorId: UserId
  _projectId: ProjectId
  isDeleted: boolean
  receivers: TaskReminderReceiverBaseOnRole[]
  rule: string
  updated: string
}

const schema: SchemaDef<ProjectReminderSchema> = {
  _id: { type: RDBType.STRING, primaryKey: true },
  _creatorId: { type: RDBType.STRING },
  _projectId: { type: RDBType.STRING },
  isDeleted: { type: RDBType.BOOLEAN },
  receivers: { type: RDBType.OBJECT },
  rule: { type: RDBType.STRING },
  updated: { type: RDBType.DATE_TIME },
}

schemaColl.add({ schema, name: 'ProjectReminder' })
