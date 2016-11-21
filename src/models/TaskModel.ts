'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import { TaskData, default as Task } from '../schemas/Task'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../schemas/Organization'
import {
  OrganizationId,
  TasklistId,
  ProjectId,
  StageId,
  TagId,
  UserId,
  TaskId
} from '../teambition'

export class TaskModel extends BaseModel {
  private _schemaName = 'Task'

  /**
   * 不分页不用 Collection
   */
  addTasklistTasksUndone(_tasklistId: TasklistId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    return this._saveCollection(`tasklist:tasks:undone/${_tasklistId}`, result, this._schemaName, (data: TaskData) => {
      return data._tasklistId === _tasklistId && !data.isDone && !data.isArchived
    })
  }

  getTasklistTasksUndone(_tasklistId: TasklistId): Observable<TaskData[]> {
    return this._get<TaskData[]>(`tasklist:tasks:undone/${_tasklistId}`)
  }

  /**
   * _collections 的索引是 '_tasklistId'
   */
  addTasklistTasksDone(_tasklistId: TasklistId, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasklist:tasks:done/${_tasklistId}`

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection<TaskData>(this._schemaName, (data: Task) => {
        return data._tasklistId === _tasklistId && data.isDone && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }

    return collection.addPage(page, result)
  }

  getTasklistTasksDone(_tasklistId: TasklistId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`tasklist:tasks:done/${_tasklistId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addMyTasksWithInbox(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me/withInbox`
    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return (<any>data._executorId) === userId &&
          !data.isDone &&
          !data.isArchived
    })
  }

  getMyTasksWithInbox(): Observable<TaskData[]> {
    const dbIndex = `tasks:me/withInbox`
    return this._get<TaskData[]>(dbIndex)
  }

  addMyDoneTasksWithInbox(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me:done/withInbox`
    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return (<any>data._executorId) === userId &&
          data.isDone &&
          !data.isArchived
    })
  }

  getMyDoneTasksWithInbox(): Observable<TaskData[]> {
    const dbIndex = `tasks:me:done/withInbox`
    return this._get<TaskData[]>(dbIndex)
  }

  addMyCreatedTasksWithInbox(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me/createdAndWithInbox`
    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return (<any>data._creatorId) === userId &&
          !data.isArchived
    })
  }

  getMyCreatedTasksWithInbox(): Observable<TaskData[]> {
    const dbIndex = `tasks:me/createdAndWithInbox`
    return this._get<TaskData[]>(dbIndex)
  }

  addMyInvolvedTasksWithInbox(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me/involvedAndWithInbox`
    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return data.involveMembers &&
          (<any[]>data.involveMembers).indexOf(userId) !== -1 &&
          !data.isArchived
    })
  }

  getMyInvolvedTasksWithInbox(): Observable<TaskData[]> {
    const dbIndex = `tasks:me/involvedAndWithInbox`
    return this._get<TaskData[]>(dbIndex)
  }

  addMyDueTasks(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me/hasdueDate`

    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return (<any>data._executorId) === userId &&
             Boolean(data.dueDate) &&
             !data.isDone &&
             !data.isArchived
    })
  }

  getMyDueTasks(): Observable<TaskData[]> | null {
    const dbIndex = `tasks:me/hasdueDate`
    return this._get<TaskData[]>(dbIndex)
  }

  addMyTasks(userId: UserId, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasks:me/noDueDate`

    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return (<any>data._executorId) === userId &&
             !data.dueDate &&
             !data.isDone &&
             !data.isArchived
    })
  }

  getMyTasks(): Observable<TaskData[]> | null {
    const dbIndex = `tasks:me/noDueDate`
    return this._get<TaskData[]>(dbIndex)
  }

  /**
   * _collections 的索引是 `organization:tasks:due/${organization._id}`
   */
  addOrganizationMyDueTasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const dbIndex = `organization:tasks:due/${organization._id}`
    const result = datasToSchemas<TaskData>(tasks, Task)

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !!data.dueDate &&
               (<any>data._executorId) === userId &&
               !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDueTasks(
    organizationId: OrganizationId,
    page: number
  ): Observable<TaskData[]> | null {
    const collection = this._collections.get(`organization:tasks:due/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addStageTasks(stageId: StageId, tasks: TaskData[]): Observable<TaskData[]> {
    const dbIndex = `stage:tasks:undone/${stageId}`
    const result = datasToSchemas<TaskData>(tasks, Task)
    return this._saveCollection(dbIndex, result, this._schemaName, (data: TaskData) => {
      return data._stageId === stageId && !data.isDone && !data.isArchived
    })
  }

  addStageDoneTasks(stageId: StageId, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `stage:tasks:done/${stageId}`
    const result = datasToSchemas<TaskData>(tasks, Task)
    let collection: Collection<TaskData> = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: TaskData) => {
          return data._stageId === stageId &&
              data.isDone &&
              !data.isArchived
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getStageTasks(stageId: StageId): Observable<TaskData[]> | null {
    return this._get<TaskData[]>(`stage:tasks:undone/${stageId}`)
  }

  getStageDoneTasks(stageId: StageId, page: number): Observable<TaskData[]> | null {
    const dbIndex = `stage:tasks:done/${stageId}`
    const collection = this._collections.get(dbIndex)
    return collection ? collection.get(page) : null
  }

  /**
   * _collections 的索引是 `organization:tasks/${organization._id}`
   */
  addOrganizationMyTasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks/${organization._id}`

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !data.dueDate &&
               (<any>data._executorId) === userId &&
               !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyTasks(organizationId: OrganizationId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`organization:tasks/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks:done/${organization._id}`
   */
  addOrganizationMyDoneTasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:done/${organization._id}`

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               data.isDone &&
               (<any>data._executorId) === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDoneTasks(organizationId: OrganizationId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`organization:tasks:done/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks:created/${organization._id}`
   */
  addOrganizationMyCreatedTasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:created/${organization._id}`

    let collection: MaxIdCollection<TaskData> = <MaxIdCollection<TaskData>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: TaskData) => {
        return (<any>data._creatorId) === userId && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrganizationMyCreatedTasks(organizationId: OrganizationId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`organization:tasks:created/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(organizationId: OrganizationId): number | undefined {
    const collection = <MaxIdCollection<TaskData>>this._collections.get(`organization:tasks:created/${organizationId}`)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 的索引是 `organization:tasks:involves/${organization._id}`
   */
  addOrgMyInvolvesTasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: TaskData[],
    page: number
  ): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:involves/${organization._id}`

    let collection: MaxIdCollection<TaskData> = <MaxIdCollection<TaskData>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: TaskData) => {
        return data.involveMembers && data.involveMembers.indexOf(<any>userId) !== -1 && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrgInvolvesTasks(organizationId: OrganizationId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`organization:tasks:involves/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyInvolvesMaxId(organizationId: OrganizationId): number | undefined {
    const collection = <MaxIdCollection<TaskData>>this._collections.get(`organization:tasks:involves/${organizationId}`)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 索引为 `project:tasks/${_projectId}`
   */
  addProjectTasks(_projectId: ProjectId, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `project:tasks/${_projectId}`
    const result = datasToSchemas<TaskData>(tasks, Task)

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: TaskData) => {
        return data._projectId === _projectId &&
            !data.isArchived &&
            !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }

    return collection.addPage(page, result)
  }

  /**
   * _collections 索引为 `project:tasks:done/${_projectId}`
   */
  addProjectDoneTasks(_projectId: ProjectId, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `project:tasks:done/${_projectId}`
    const result = datasToSchemas<TaskData>(tasks, Task)

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: TaskData) => {
        return data._projectId === _projectId &&
            !data.isArchived &&
            data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }

    return collection.addPage(page, result)
  }

  getProjectTasks(_projectId: ProjectId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`project:tasks/${_projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getProjectDoneTasks(_projectId: ProjectId, page: number): Observable<TaskData[]> | null {
    const collection = this._collections.get(`project:tasks:done/${_projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addByTagId(tagId: TagId, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `tag:tasks/${tagId}`
    const result = datasToSchemas(tasks, Task)
    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: TaskData) => {
        return !data.isArchived && data.tagIds && data.tagIds.indexOf(tagId) !== -1
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByTagId(tagId: TagId, page: number): Observable<TaskData[]> | null {
    const dbIndex = `tag:tasks/${tagId}`
    let collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addOne(task: TaskData): Observable<TaskData> {
    const result = dataToSchema<TaskData>(task, Task)
    return this._save(result)
  }

  getOne(_id: TaskId): Observable<TaskData> | null {
    return this._get<TaskData>(<any>_id)
  }
}

export default new TaskModel
