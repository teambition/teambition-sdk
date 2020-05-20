import { TaskReminderId, TaskId } from 'teambition-types'

import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'
import { ProjectReminderSchema } from './ProjectReminder'

export enum ReminderRuleType {
  startDate = 'startDate',
  dueDate = 'dueDate',
  custom = 'custom',
}

export enum ReminderUnit {
  minute = 'minute',
  hour = 'hour',
  day = 'day',
}

export enum TaskReminderReceiverBaseOnRole {
  executor = 'role/executor',
  involver = 'role/involver',
  creator = 'role/creator',
}

export enum TaskReminderSource {
  task = 'source:task',
  project = 'source:project',
}

interface TaskReminderBaseSchema {
  _id: TaskReminderId
  boundToObjectId: TaskId
  boundToObjectType: 'task'
  isDeleted: boolean
  rule: string
}

// 来源于项目规则
interface TaskReminderBaseProjectSchema
  extends TaskReminderBaseSchema,
    Pick<ProjectReminderSchema, 'receivers'> {
  labels: TaskReminderSource.task[]
}

// 来源于自身的规则
interface TaskReminderBaseOwnSchema extends TaskReminderBaseSchema {
  labels: TaskReminderSource.project[]
  receivers: string[]
}

export type TaskReminderSchema =
  | TaskReminderBaseProjectSchema
  | TaskReminderBaseOwnSchema

const schema: SchemaDef<TaskReminderSchema> = {
  _id: { type: RDBType.STRING, primaryKey: true },
  boundToObjectId: { type: RDBType.STRING },
  boundToObjectType: { type: RDBType.STRING },
  isDeleted: { type: RDBType.BOOLEAN },
  labels: { type: RDBType.OBJECT },
  receivers: { type: RDBType.OBJECT },
  rule: { type: RDBType.STRING },
}

schemaColl.add({ schema, name: 'TaskReminder' })
