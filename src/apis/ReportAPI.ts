'use strict'
import { Observable } from 'rxjs/Observable'
import {
  default as ReportFetch,
  GetReportAccomplishedOption,
  TaskType,
  GetReportInprogressOption,
  GetReportNotStartOption,
  GetUnassignedOption
} from '../fetchs/ReportFetch'
import ReportModel from '../models/ReportModel'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'
import { makeColdSignal } from './utils'
import { ProjectId } from '../teambition'

export class ReportAPI {
  getAccomplished (
    projectId: ProjectId,
    taskType: 'subtask',
    option: GetReportAccomplishedOption
  ): Observable<SubtaskData[]>

  getAccomplished (
    projectId: ProjectId,
    taskType: 'task',
    option: GetReportAccomplishedOption
  ): Observable<TaskData[]>

  getAccomplished (
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<(TaskData | SubtaskData)[]>

  /**
   * 当 option.isWeekSearch 为 true 时不分页
   * 即使传入 page count 参数也会被忽略掉
   * 并且传入的 option.isWeekSearch 为 true 和 false 时返回的流也不一样
   */
  getAccomplished (
    projectId: ProjectId,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<(TaskData | SubtaskData)[]> {
    return makeColdSignal<any>(() => {
      const cache = ReportModel.getData(projectId, option.page, 'accomplished', taskType, option.queryType, option.isWeekSearch)
      if (cache) {
        return cache
      }
      return ReportFetch.getAccomplished(projectId, taskType, option)
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'accomplished', taskType, option.queryType, option.isWeekSearch))
    })
  }

  getInprogress(
    projectId: ProjectId,
    taskType: 'task',
    option: GetReportInprogressOption
  ): Observable<TaskData[]>

  getInprogress(
    projectId: ProjectId,
    taskType: 'subtask',
    option: {
      queryType: 'all'
      page?: number
      count?: number
      [index: string]: any
    }
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
    return makeColdSignal<any>(() => {
      const cache = ReportModel.getData(projectId, option.page, 'progress', taskType, option.queryType)
      if (cache) {
        return cache
      }
      return ReportFetch.getInprogress(projectId, taskType, option)
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'progress', taskType, option.queryType))
    })
  }

  getNotStart(
    projectId: ProjectId,
    option: GetReportNotStartOption
  ): Observable<TaskData[]> {
    return makeColdSignal<any>(() => {
      const cache = ReportModel.getData(projectId, option.page, 'notstart', 'task')
      if (cache) {
        return cache
      }
      return ReportFetch.getNotStart(projectId, option)
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'notstart', 'task'))
    })
  }

  getUnassigned(projectId: ProjectId, option: GetUnassignedOption): Observable<TaskData[]> {
    return makeColdSignal<any[]>(() => {
      const cache = ReportModel.getData(projectId, option.page, 'unassigned')
      if (cache) {
        return cache
      }
      return ReportFetch.getUnassigned(projectId, option)
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'unassigned', 'task'))
    })
  }
}

export default new ReportAPI
