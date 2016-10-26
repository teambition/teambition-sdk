'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'
import { ProjectId } from '../teambition'

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

export interface GetUnassignedOption {
  page?: number
  count?: number
  [index: string]: any
}

export class ReportFetch extends BaseFetch {
  getAccomplished(projectId: ProjectId, taskType: 'task', option: GetReportAccomplishedOption): Observable<(TaskData[])>

  getAccomplished(projectId: ProjectId, taskType: 'subtask', option: GetReportAccomplishedOption): Observable<(SubtaskData[])>

  getAccomplished(
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<(TaskData | SubtaskData)[]>

  getAccomplished(
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<(TaskData | SubtaskData)[]> {
    option['taskType'] = taskType
    return this.fetch.get(`projects/${projectId}/report-accomplished`, option)
  }

  getInprogress(
    projectId: ProjectId,
    taskType: 'task',
    option: GetReportInprogressOption
  ): Observable<TaskData[]>

  getInprogress(
    projectId: ProjectId,
    taskType: 'subtask',
    option: GetReportInprogressOption
  ): Observable<SubtaskData[]>

  getInprogress(
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Observable<(TaskData | SubtaskData)[]>

  getInprogress(
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Observable<(TaskData | SubtaskData)[]> {
    option['taskType'] = taskType
    return this.fetch.get(`projects/${projectId}/report-in-progress`, option)
  }

  getNotStart(
    projectId: ProjectId,
    option: GetReportNotStartOption
  ): Observable<TaskData[]> {
    return this.fetch.get(`projects/${projectId}/report-not-started`, option)
  }

  getUnassigned(projectId: ProjectId, option: GetUnassignedOption): Observable<TaskData[]> {
    return this.fetch.get(`projects/${projectId}/report-unassigned`, option)
  }
}

export default new ReportFetch
