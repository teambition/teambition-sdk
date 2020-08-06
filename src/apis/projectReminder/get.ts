import { ProjectId } from 'teambition-types'

import { ProjectReminderSchema } from '../../schemas/ProjectReminder'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'

/**
 * 获取项目级别的任务提醒规则
 */
export function getProjectRemindersFetch(
  this: SDKFetch,
  projectId: ProjectId
) {
  return this.get<ProjectReminderSchema[]>(`projects/${projectId}/reminders`)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getProjectReminders: typeof getProjectRemindersFetch
  }
}

SDKFetch.prototype.getProjectReminders = getProjectRemindersFetch

/**
 * 获取项目级别的任务提醒规则
 */
function getProjectReminders(
  this: SDK,
  projectId: ProjectId,
) {
  return this.lift<ProjectReminderSchema>({
    cacheValidate: CacheStrategy.Request,
    query: {
      where: {  _projectId: projectId },
      orderBy: [{ fieldName: 'updated' }]
    },
    request: this.fetch.getProjectReminders(projectId),
    tableName: 'ProjectReminder',
  })
}

declare module '../../SDK' {
  interface SDK {
    getProjectReminders: typeof getProjectReminders
  }
}

SDK.prototype.getProjectReminders = getProjectReminders
