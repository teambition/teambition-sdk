'use strict'
import BaseFetch from './BaseFetch'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'

export type GetReportAccomplishedTaskType = 'task' | 'subtask'
export type GetReportAccomplishedQueryType = 'delay' | 'ontime' | 'all'
export interface GetReportAccomplishedOption {
  queryType: GetReportAccomplishedQueryType
  isWeekSearch: boolean
  count?: number
  page?: number
  [index: string]: any
}

export class ReportFetch extends BaseFetch {
  getReportAccomplished(projectId: string, taskType: 'task', option: GetReportAccomplishedOption): Promise<(TaskData[])>

  getReportAccomplished(projectId: string, taskType: 'subtask', option: GetReportAccomplishedOption): Promise<(SubtaskData[])>

  getReportAccomplished(
    projectId: string,
    taskType: GetReportAccomplishedTaskType,
    option: GetReportAccomplishedOption
  ): Promise<(TaskData[] | SubtaskData[])>

  getReportAccomplished(
    projectId: string,
    taskType: GetReportAccomplishedTaskType,
    option: GetReportAccomplishedOption
  ): Promise<(TaskData[] | SubtaskData[])> {
    option['taskType'] = taskType
    return this.fetch.get(`projects/${projectId}/report-accomplished`, option)
  }
}

export default new ReportFetch()
