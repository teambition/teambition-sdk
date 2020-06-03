import { ProjectId } from 'teambition-types'

import { ProjectReminderSchema } from '../../schemas/ProjectReminder'
import { SDKFetch } from '../../SDKFetch'

interface Payload {
  addReminders: Pick<ProjectReminderSchema, 'rule' | 'receivers'>[]
  delReminders: Pick<ProjectReminderSchema, '_id'>[]
  updateReminders: Pick<ProjectReminderSchema, '_id' | 'rule' | 'receivers'>[]
}

/**
 * 更新项目级别的任务提醒规则
 */
export function updateProjectRemindersFetch(
  this: SDKFetch,
  projectId: ProjectId,
  payload: Payload,
) {
  return this.put<ProjectReminderSchema[]>(
    `projects/${projectId}/reminders`,
    payload
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateProjectReminders: typeof updateProjectRemindersFetch
  }
}

SDKFetch.prototype.updateProjectReminders = updateProjectRemindersFetch
