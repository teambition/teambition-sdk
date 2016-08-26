'use strict'
import BaseFetch from './BaseFetch'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'

export type TaskType = 'task' | 'subtask'
export type GetReportAccomplishedQueryType = 'delay' | 'ontime' | 'all'
export interface GetReportAccomplishedOption {
  queryType: GetReportAccomplishedQueryType
  isWeekSearch: boolean
  count?: number
  page?: number
  [index: string]: any
}

export interface GetReportInprogressOption {
  queryType: GetReportAccomplishedQueryType
  count?: number
  page?: number
  [index: string]: any
}

export interface GetReportNotStartOption {
  page?: number
  count?: number
  [index: string]: any
}

export class ReportFetch extends BaseFetch {
  getAccomplished(projectId: string, taskType: 'task', option: GetReportAccomplishedOption): Promise<(TaskData[])>

  getAccomplished(projectId: string, taskType: 'subtask', option: GetReportAccomplishedOption): Promise<(SubtaskData[])>

  getAccomplished(
    projectId: string,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Promise<TaskData[]> | Promise<SubtaskData[]>

  getAccomplished(
    projectId: string,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Promise<TaskData[]> | Promise<SubtaskData[]> {
    option['taskType'] = taskType
    return this.fetch.get(`projects/${projectId}/report-accomplished`, option)
  }

  getInprogress(
    projectId: string,
    taskType: 'task',
    option: GetReportInprogressOption
  ): Promise<TaskData[]>

  getInprogress(
    projectId: string,
    taskType: 'subtask',
    option: GetReportInprogressOption
  ): Promise<SubtaskData[]>

  getInprogress(
    projectId: string,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Promise<TaskData[]> | Promise<SubtaskData[]>

  getInprogress(
    projectId: string,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Promise<TaskData[]> | Promise<SubtaskData[]> {
    option['taskType'] = taskType
    return this.fetch.get(`projects/${projectId}/report-in-progress`, option)
  }

  getNotStart(
    projectId: string,
    option: GetReportNotStartOption
  ): Promise<TaskData[]> {
    return this.fetch.get(`projects/${projectId}/report-not-started`, option)
  }
}

export default new ReportFetch()
