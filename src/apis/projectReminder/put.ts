import { ProjectId } from 'teambition-types'

import { ProjectReminderSchema } from '../../schemas/ProjectReminder'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'

interface Payload {
  addReminders: Array<Pick<ProjectReminderSchema, 'rule' | 'receivers'>>
  delReminders: Array<Pick<ProjectReminderSchema, '_id'>>
  updateReminders: Array<Pick<ProjectReminderSchema, '_id' | 'rule' | 'receivers'>>
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

/**
 * 更新项目级别的任务提醒规则
 */
function updateProjectReminders(
  this: SDK,
  projectId: ProjectId,
  payload: Payload
) {
  return this.lift<ProjectReminderSchema[]>({
    method: 'update',
    clause: { _id: projectId },
    request: this.fetch.updateProjectReminders(projectId, payload),
    tableName: 'ProjectReminder',
  })
}

declare module '../../SDK' {
  interface SDK {
    updateProjectReminders: typeof updateProjectReminders
  }
}

SDK.prototype.updateProjectReminders = updateProjectReminders
