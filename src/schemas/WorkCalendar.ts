import { OrganizationId, WorkCalendarId } from 'teambition-types'
import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'

type CalendarRuleTime = string[]

export interface WorkCalendarRule {
  name?: string
  rule?: string
  time: CalendarRuleTime
  kind: 'holiday' | 'workday'
  start?: string
  until?: string
}

export interface WorkCalendarSchema {
  _id: WorkCalendarId
  defaults: WorkCalendarRule[]
  personalizations: WorkCalendarRule[]
  isDeleted: boolean
  created: string
  updated: string
  _organizationId: OrganizationId
}

const schema: SchemaDef<WorkCalendarSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  defaults: {
    type: RDBType.OBJECT
  },
  personalizations: {
    type: RDBType.OBJECT
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  _organizationId: {
    type: RDBType.STRING
  }
}

schemaColl.add({ name: 'WorkCalendar', schema })
