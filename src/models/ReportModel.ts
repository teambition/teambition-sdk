'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import Collection from './BaseCollection'
import TaskSchema, { TaskData } from '../schemas/Task'
import SubtaskSchema, { SubtaskData } from '../schemas/Subtask'
import { datasToSchemas } from '../utils'
import { ProjectId } from '../teambition'

export type TaskStatus = 'accomplished' | 'progress' | 'notstart' | 'unassigned'
export type TaskType = 'all' | 'delay' | 'ontime'

export class ReportModel extends Model {

  storeData (
    projectId: ProjectId,
    data: (TaskData | SubtaskData)[],
    page: number,
    status: TaskStatus,
    schema?: 'task' | 'subtask',
    taskType?: TaskType,
    isWeekSearch?: boolean
  ): Observable<(TaskData | SubtaskData)[]> {
    if (schema === 'task') {
      if (status === 'accomplished') {
        if (taskType === 'all') {
          if (isWeekSearch) {
            return this.storeThisWeekAccomplishedAllTasks(projectId, <TaskData[]>data)
          } else {
            return this.storeAccomplishedAllTasks(projectId, <TaskData[]>data, page)
          }
        } else if (taskType === 'delay') {
          if (isWeekSearch) {
            return this.storeThisweekAccomplishedDelayTasks(projectId, <TaskData[]>data)
          } else {
            return this.storeAccomplishedDelayTasks(projectId, <TaskData[]>data, page)
          }
        } else if (taskType === 'ontime') {
          if (isWeekSearch) {
            return this.storeThisweekAccomplishedOntimeTasks(projectId, <TaskData[]>data)
          } else {
            return this.storeAccomplishedOntimeTasks(projectId, <TaskData[]>data, page)
          }
        } else {
          return Observable.throw(new Error(`unsppported taskType: ${taskType}, expectd: 'all' | 'delay' | 'ontime'`))
        }
      } else if (status === 'progress') {
        if (taskType === 'ontime') {
          return this.storeProgressOntimeTasks(projectId, <TaskData[]>data, page)
        } else if (taskType === 'delay') {
          return this.storeProgressDelayTasks(projectId, <TaskData[]>data, page)
        } else if (taskType === 'all') {
          return this.storeProgressAllTasks(projectId, <TaskData[]>data, page)
        } else {
          return Observable.throw(new Error(`unsppported taskType: ${taskType}, expectd: 'ontime' | 'delay'`))
        }
      } else if (status === 'notstart') {
        return this.storeNotStartTasks(projectId, <TaskData[]>data, page)
      } else if (status === 'unassigned') {
        return this.storeUnassignedTasks(projectId, <TaskData[]>data, page)
      } else {
        return Observable.throw(new Error(`unsppported task status: ${status}, expectd: 'accomplished' | 'progress' | 'notstart'`))
      }
    } else if (schema === 'subtask') {
      if (status === 'accomplished') {
        if (taskType === 'all') {
          if (isWeekSearch) {
            return this.storeThisweekAccomplishedAllSubtasks(projectId, <SubtaskData[]>data)
          } else {
            return this.storeAccomplishedAllSubtasks(projectId, <SubtaskData[]>data, page)
          }
        } else if (taskType === 'delay') {
          if (isWeekSearch) {
            return this.storeThisweekAccomplishedDelaySubtasks(projectId, <SubtaskData[]>data)
          } else {
            return this.storeAccomplishedDelaySubtasks(projectId, <SubtaskData[]>data, page)
          }
        } else if (taskType === 'ontime') {
          if (isWeekSearch) {
            return this.storeThisweekAccomplishedOntimeSubtasks(projectId, <SubtaskData[]>data)
          } else {
            return this.storeAccomplishedOntimeSubtasks(projectId, <SubtaskData[]>data, page)
          }
        } else {
          return Observable.throw(new Error(`unsppported taskType: ${taskType}, expectd: 'all' | 'delay' | 'ontime'`))
        }
      } else if (status === 'progress') {
        if (taskType === 'all') {
          return this.storeProgressAllSubtasks(projectId, <SubtaskData[]>data, page)
        } else {
          return Observable.throw(new Error(`unsppported taskType: ${taskType}, expectd: 'all'`))
        }
      } else if (status === 'notstart') {
        return this.storeNotStartSubtasks(projectId, <SubtaskData[]>data, page)
      } else {
        return Observable.throw(new Error(`unsppported task status: ${status}, expectd: 'accomplished' | 'progress' | 'notstart'`))
      }
    } else {
      return Observable.throw(new Error(`unsppported schema: ${schema}, expectd: 'task' | 'subtask'`))
    }
  }

  getData(
    projectId: ProjectId,
    page: number,
    status: TaskStatus,
    schema?: 'task',
    type?: TaskType,
    isWeekSearch?: boolean
  ): Observable<TaskData[]>

  getData(
    projectId: ProjectId,
    page: number,
    status: TaskStatus,
    schema?: 'subtask',
    type?: TaskType,
    isWeekSearch?: boolean
  ): Observable<SubtaskData[]>

  getData(
    projectId: ProjectId,
    page: number,
    status: TaskStatus,
    schema?: 'task' | 'subtask',
    type?: TaskType,
    isWeekSearch?: boolean
  ): Observable<(TaskData | SubtaskData)[]>

  getData(
    projectId: ProjectId,
    page: number,
    status: TaskStatus,
    schema?: 'task' | 'subtask',
    type?: TaskType,
    isWeekSearch?: boolean
  ): Observable<(TaskData | SubtaskData)[]> {
    if (status === 'notstart') {
      type = 'all'
    }
    if (status === 'unassigned') {
      type = 'all'
      schema = 'task'
    }
    const weekSearch = isWeekSearch ? 'thisweek:' : ''
    const index = `project:report:${status}:${weekSearch + type}:${schema}s/${projectId}`
    if (weekSearch) {
      return this._get<any>(index)
    }
    const collection = this._collections.get(index)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * 存储的是非本周的任务
   * 需要分页
   */
  private storeAccomplishedAllTasks(
    projectId: ProjectId,
    data: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:accomplished:all:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return data._projectId === projectId &&
               data.isDone &&
               !data.isArchived &&
               Date.now() - new Date(data.accomplished).valueOf() > 604800000
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储本周已完成的任务
   * 不需要分页
   */
  private storeThisWeekAccomplishedAllTasks(projectId: ProjectId, data: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:all:tasks/${projectId}`, result, 'Task', data => {
      return data.isDone &&
            !data.isArchived &&
            data._projectId === projectId &&
            Date.now() - new Date(data.accomplished).valueOf() <= 604800000
    })
  }

  /**
   * 存储进行中的任务列表
   * 定义:
   * & 未被完成
   * & 未被归档
   * & _projectId 字段匹配
   * &
   * (
   * | 有截止日期
   *   | 没有开始时间
   *   | 有开始时间 & 开始时间在今天以后
   * | 没有截止日期
   *   & 有开始时间 & 开始时间在今天以前
   * )
   */
  private storeProgressOntimeTasks(projectId: ProjectId, data: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:progress:ontime:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        const now = Date.now()
        return !data.isDone &&
          !data.isArchived &&
          data._projectId === projectId &&
          (
            (
              data.dueDate && new Date(data.dueDate).valueOf() > now &&
              (
                !data.startDate ||
                (
                  data.startDate &&
                  new Date(data.startDate).valueOf() < now
                )
              )
            ) ||
            !data.dueDate && data.startDate && new Date(data.startDate).valueOf() < now
          )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储未开始的任务
   * 定义:
   * & 未被完成
   * & 未被归档
   * & _projectId 字段匹配
   * &
   * (
   * | 没有截止日期
   *   | 有开始时间 & 开始时间在今天以后
   *   | 没有开始时间
   * | 有截止日期 & 截止日期在今天以后
   *   | 有开始时间 & 开始时间在今天以后
   *   | 没有开始时间
   * )
   */
  private storeNotStartTasks(projectId: ProjectId, data: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:notstart:all:tasks/${projectId}`
    const now = Date.now()
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return data._projectId === projectId &&
          !data.isArchived &&
          !data.isDone &&
          (
            !data.dueDate &&
            (
              !data.startDate ||
              (
                data.startDate &&
                new Date(data.startDate).valueOf() > now
              )
            ) ||
            (
              data.dueDate &&
              new Date(data.dueDate).valueOf() < now &&
              (
                (
                  data.startDate &&
                  new Date(data.startDate).valueOf() > now
                ) ||
                !data.startDate
              )
            )
          )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  private storeNotStartSubtasks(projectId: ProjectId, data: SubtaskData[], page: number): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    const dbIndex = `project:report:notstart:all:subtasks/${projectId}`
    const now = Date.now()
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Subtask', (data: SubtaskData) => {
        return data._projectId === projectId &&
          !data.isDone &&
          (
            !data.dueDate ||
            (
              data.dueDate &&
              new Date(data.dueDate).valueOf() < now
            )
          )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储进行中的任务列表
   * 定义:
   * & 未被完成
   * & 未被归档
   * & _projectId 字段匹配
   * & 有截止日期
   * & 截止日期在今天之前
   */
  private storeProgressDelayTasks(projectId: ProjectId, data: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:progress:delay:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return !data.isDone &&
          !data.isArchived &&
          data._projectId === projectId &&
          data.dueDate &&
          new Date(data.dueDate).valueOf() < Date.now()
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  private storeProgressAllTasks(projectId: ProjectId, data: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:progress:all:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return !data.isDone &&
          !data.isArchived &&
          data._projectId === projectId &&
          (!!data.startDate || !!data.dueDate)
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  private storeProgressAllSubtasks(projectId: ProjectId, data: SubtaskData[], page: number): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    const dbIndex = `project:report:progress:all:subtasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Subtask', (data: SubtaskData) => {
        return !data.isDone &&
          data._projectId === projectId &&
          (
            (data.dueDate && new Date(data.dueDate).valueOf() > Date.now()) ||
            !data.dueDate
          )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储的是非本周延期的任务
   * 需要分页
   * 定义:
   * & 被完成
   * & 完成时间在一周前
   * & 未被归档
   * & 截止时间小于被完成时间
   * & _projectId 字段匹配
   */
  private storeAccomplishedDelayTasks(
    projectId: ProjectId,
    data: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:accomplished:delay:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return data._projectId === projectId &&
               data.isDone &&
               !data.isArchived &&
               Date.now() - new Date(data.accomplished).valueOf() > 604800000 &&
               data.dueDate &&
               new Date(data.accomplished).valueOf() > new Date(data.dueDate).valueOf()
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  private storeAccomplishedDelaySubtasks(projectId: ProjectId, data: SubtaskData[], page: number): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    const dbIndex = `project:report:accomplished:delay:subtasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Subtask', (data: SubtaskData) => {
        return data._projectId === projectId &&
               data.isDone &&
               Date.now() - new Date(data.updated).valueOf() > 604800000 &&
               data.dueDate &&
               new Date(data.updated).valueOf() > new Date(data.dueDate).valueOf()
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储本周 delay 的任务
   * 不需要分页
   * 定义:
   * & 被完成
   * & 完成时间在一周前
   * & 未被归档
   * & 截止时间小于被完成时间
   * & _projectId 字段匹配
   */
  private storeThisweekAccomplishedDelayTasks(projectId: ProjectId, data: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:delay:tasks/${projectId}`, result, 'Task', data => {
      return data.isDone &&
            !data.isArchived &&
            data._projectId === projectId &&
            Date.now() - new Date(data.accomplished).valueOf() <= 604800000 &&
            data.dueDate &&
            new Date(data.accomplished).valueOf() > new Date(data.dueDate).valueOf()
    })
  }

  private storeThisweekAccomplishedDelaySubtasks(projectId: ProjectId, data: SubtaskData[]): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:delay:subtasks/${projectId}`, result, 'Subtask', data => {
      return data.isDone &&
            data._projectId === projectId &&
            Date.now() - new Date(data.updated).valueOf() <= 604800000 &&
            data.dueDate &&
            new Date(data.updated).valueOf() > new Date(data.dueDate).valueOf()
    })
  }

  /**
   * 存储的是非本周 ontime 的任务
   * 需要分页
   * 定义:
   * & 已完成
   * & 完成时间在一周以前
   * & 未被归档
   * & _projectId 字段匹配
   * &
   * (
   * | 开始时间小于被完成的时间
   * | 完成时间小于截止时间
   * )
   */
  private storeAccomplishedOntimeTasks(
    projectId: ProjectId,
    data: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:accomplished:ontime:tasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return data._projectId === projectId &&
               data.isDone &&
               !data.isArchived &&
               Date.now() - new Date(data.accomplished).valueOf() > 604800000 &&
               (
                 (
                   data.dueDate &&
                   new Date(data.accomplished).valueOf() < new Date(data.dueDate).valueOf()
                 ) ||
                 (
                   data.startDate &&
                   new Date(data.accomplished).valueOf() > new Date(data.startDate).valueOf()
                 ) ||
                 !data.dueDate
               )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  private storeAccomplishedOntimeSubtasks(
    projectId: ProjectId,
    data: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    const dbIndex = `project:report:accomplished:ontime:subtasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Subtask', (data: SubtaskData) => {
        return data._projectId === projectId &&
               data.isDone &&
               Date.now() - new Date(data.updated).valueOf() > 604800000 &&
               (
                 (
                   data.dueDate &&
                   new Date(data.updated).valueOf() < new Date(data.dueDate).valueOf()
                 ) ||
                 !data.dueDate
               )
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储本周 ontime 的任务
   * 不需要分页
   * 定义:
   * & 已完成
   * & 完成时间在一周以前
   * & 未被归档
   * & _projectId 字段匹配
   * &
   * (
   * | 开始时间小于被完成的时间
   * | 完成时间小于截止时间
   * )
   */
  private storeThisweekAccomplishedOntimeTasks(projectId: ProjectId, data: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:ontime:tasks/${projectId}`, result, 'Task', data => {
      return data.isDone &&
            !data.isArchived &&
            data._projectId === projectId &&
            Date.now() - new Date(data.accomplished).valueOf() <= 604800000 &&
            (
              (
                data.dueDate &&
                new Date(data.accomplished).valueOf() < new Date(data.dueDate).valueOf()
              ) ||
              (
                data.startDate &&
                new Date(data.accomplished).valueOf() > new Date(data.startDate).valueOf()
              )
            )
    })
  }

  private storeThisweekAccomplishedOntimeSubtasks(projectId: ProjectId, data: SubtaskData[]): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:ontime:subtasks/${projectId}`, result, 'Subtask', data => {
      return data.isDone &&
            data._projectId === projectId &&
            Date.now() - new Date(data.updated).valueOf() <= 604800000 &&
            data.dueDate &&
            new Date(data.updated).valueOf() < new Date(data.dueDate).valueOf()
    })
  }

  /**
   * 存储非本周的子任务
   * 需要分页
   */
  private storeAccomplishedAllSubtasks(
    projectId: ProjectId,
    data: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    const dbIndex = `project:report:accomplished:all:subtasks/${projectId}`
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection('Subtask', (data: SubtaskData) => {
        return data._projectId === projectId && data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  /**
   * 存储本周已完成的子任务
   * 不需要分页
   */
  private storeThisweekAccomplishedAllSubtasks(projectId: ProjectId, data: SubtaskData[]): Observable<SubtaskData[]> {
    const result = datasToSchemas(data, SubtaskSchema)
    return this._saveCollection(`project:report:accomplished:thisweek:all:subtasks/${projectId}`, result, 'Subtask', data => {
      return data.isDone &&
            data._projectId === projectId &&
            Date.now() - new Date(data.updated).valueOf() <= 604800000
    })
  }

  private storeUnassignedTasks(projectId: ProjectId, data: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas(data, TaskSchema)
    const dbIndex = `project:report:unassigned:all:tasks/${projectId}`
    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection('Task', (data: TaskData) => {
        return !data.isArchived && !data.isDone && !data._executorId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }
}

export default new ReportModel
