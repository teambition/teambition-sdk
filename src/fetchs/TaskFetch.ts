'use strict'
import { Observable } from 'rxjs/Observable'
import Fetch from './BaseFetch'
import { TaskData, TasksMeCount, TaskPriority } from '../schemas/Task'
import {
  visibility,
  ExecutorOrCreator,
  TaskId,
  SubtaskId,
  UserId,
  TasklistId,
  StageId,
  TagId,
  ProjectId,
  OrganizationId
} from '../teambition'

export interface TasksMeOptions {
  count?: number
  page?: number
  hasDueDate?: boolean
  startDate?: string
  endDate?: string
  isCreator?: boolean
  isInvolved?: boolean
  isDone?: boolean
}

export interface TasksMeCountOptions {
  type?: 'executed' | 'created' | 'involved'
}

export interface OrgsTasksMeOptions {
  hasDuedate?: boolean
  page: number
  isDone: boolean
}

export interface CreateTaskOptions {
  content: string
  _tasklistId: TasklistId
  _stageId?: StageId
  _executorId?: UserId
  involveMembers?: UserId[]
  dueDate?: string
  priority?: TaskPriority
  recurrence?: string
  tagIds?: TagId[]
}

export interface GetOrgsTasksCreatedOptions {
  page: number
  maxId: number
}

export interface UpdateTaskOptions {
  _executorId?: UserId
  _projectId?: ProjectId
  _tasklistId?: TasklistId
  tagsId?: TagId[]
  _stageId?: StageId
  involveMembers?: UserId[]
  isDone?: boolean
  priority?: TaskPriority
  dueDate?: string
  note?: string
  content?: string
  recurrence?: string[]
  tasklist?: TasklistId
}

export interface ForkTaskOptions {
  _stageId: StageId
  doLink?: boolean
  doLinked?: boolean
}

export interface ImportTaskOptions {
  _stageId?: StageId
  tasks: TaskData[]
  involveMembers?: UserId[]
  _executorId?: UserId
  dueDate?: string
  visiable?: visibility
}

export interface MoveTaskOptions {
  _stageId: StageId
  withTags?: boolean
}

export interface GetStageTasksOptions {
  isDone?: boolean
  _executorId?: UserId
  dueDate?: string
  accomplished?: string
  all?: boolean
  limit?: number
  page?: number
}

export interface BatchUpdateVisibilityResponse {
  _stageId: StageId
  updated: string
  visible: string
}

export interface BatchUpdateExecutorResponse {
  _stageId: StageId
  updated: string
  _executorId: string
}

export interface BatchUpdateDuedateResponse {
  _stageId: StageId
  dueDate: string
  updated: string
}

export interface ArchiveTaskResponse {
  isArchived: boolean
  updated: string
  _id: TaskId
  _projectId: ProjectId
}

export interface UpdateNoteResponse {
  _id: TaskId
  updated: string
  note: string
}

export interface UpdateTagsResponse {
  _id: TaskId
  tagIds: TagId[]
  updated: string
}

export interface UpdateStatusResponse {
  _id: TaskId
  updated: string
  isDone: boolean
}

export interface UpdateContentResponse {
  _id: TaskId
  content: string
  updated: string
}

export interface UpdateDueDateResponse {
  _id: TaskId
  updated: string
  dueDate: string
}

export interface UpdateExecutorResponse {
  _executorId: UserId
  _id: TaskId
  executor: ExecutorOrCreator
  involveMembers?: UserId[]
  updated: string
}

export interface UpdateInvolveMembersResponse {
  _id: TaskId
  involveMembers: UserId[]
  updated: string
}

export interface UpdateSubtaskIdsResponse {
  subtaskIds: SubtaskId[]
}

export class TaskFetch extends Fetch {
  getTasksMe (option: TasksMeOptions): Observable<TaskData[]> {
    return this.fetch.get(`v2/tasks/me`, option)
  }

  getTasksMeCount(option: TasksMeCountOptions): Observable<TasksMeCount> {
    return this.fetch.get(`v2/tasks/me/count`, option)
  }

  getOrgsTasksMe(organizationId: OrganizationId, option: OrgsTasksMeOptions): Observable<TaskData[]> {
    return this.fetch.get(`organizations/${organizationId}/tasks/me`, option)
  }

  getOrgsTasksCreated(organizationId: OrganizationId, options: GetOrgsTasksCreatedOptions): Observable<TaskData[]> {
    const query = this.checkQuery(options)
    return this.fetch.get(`organizations/${organizationId}/tasks/me/created`, query)
  }

  getOrgsTasksInvolves(organizationId: OrganizationId, option: {
    page?: number
    maxId?: number
  } = {
    page: 1
  }): Observable<TaskData[]> {
    const query = this.checkQuery(option)
    return this.fetch.get(`organizations/${organizationId}/tasks/me/involves`, query)
  }

  getByTagId(tagId: TagId, query?: any): Observable<TaskData[]> {
    return this.fetch.get(`tags/${tagId}/tasks`, query)
  }

  create(createTaskData: CreateTaskOptions): Observable<TaskData> {
    return this.fetch.post(`tasks`, createTaskData)
  }

  get(_taskId: TaskId): Observable<TaskData>

  get(_taskId: TaskId, detailType: string): Observable<TaskData>

  get(_taskId: TaskId, detailType?: string): Observable<TaskData> {
    return this.fetch.get(`tasks/${_taskId}`, detailType ? {
      detailType: detailType
    } : null)
  }

  getStageTasks(stageId: StageId, query?: any): Observable<TaskData[]> {
    return this.fetch.get(`stages/${stageId}/tasks`, query)
  }

  getStageDoneTasks(stageId: StageId, query: any = {}): Observable<TaskData[]> {
    query.isDone = true
    return this.fetch.get(`stages/${stageId}/tasks`, query)
  }

  getProjectTasks(_id: ProjectId, query?: any): Observable<TaskData[]> {
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  getProjectDoneTasks(_id: ProjectId, query: any = {}): Observable<TaskData[]> {
    query.isDone = true
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  update<T extends UpdateTaskOptions>(_taskId: TaskId, updateData: T): Observable<T> {
    return this.fetch.put(`tasks/${_taskId}`, updateData)
  }

  delete(_taskId: TaskId): Observable<{}> {
    return this.fetch.delete(`tasks/${_taskId}`)
  }

  archive(_taskId: TaskId): Observable<ArchiveTaskResponse> {
    return this.fetch.post(`tasks/${_taskId}/archive`)
  }

  batchUpdateDuedate(stageId: StageId, dueDate: string): Observable<BatchUpdateDuedateResponse> {
    return this.fetch.put(`stages/${stageId}/tasks/dueDate`, {
      dueDate: dueDate
    })
  }

  batchUpdateExecutor(stageId: StageId, _executorId: UserId): Observable<BatchUpdateExecutorResponse> {
    return this.fetch.put(`stages/${stageId}/tasks/executor`)
  }

  batchUpdateVisibility(
    stageId: StageId,
    visible: 'members' | 'involves'
  ): Observable<BatchUpdateVisibilityResponse> {
    return this.fetch.put(`stages/${stageId}/tasks/visible`)
  }

  fork(_taskId: TaskId, forkData: ForkTaskOptions): Observable<TaskData> {
    return this.fetch.put(`tasks/${_taskId}/fork`, forkData)
  }

  getByStage(_stageId: StageId, options?: {
    count: number
    page: number
  }): Observable<TaskData[]> {
    return this.fetch.get(`stages/${_stageId}/tasks`, options)
  }

  getByTasklist(_tasklistId: TasklistId, options: {
    isDone?: boolean
    _executorId?: UserId
    dueDate?: string
    accomplished?: string
    all?: boolean
    limit?: number
    page?: number
    dumpType?: 'json' | 'excel'
  }): Observable<TaskData[]> {
    return this.fetch.get(`tasklists/${_tasklistId}/tasks`, options)
  }

  importTasks(_tasklistId: TasklistId, importData: ImportTaskOptions) {
    return this.fetch.post(`tasklists/${_tasklistId}/import_tasks`, importData)
  }

  getInvolves(): Observable<TaskData>

  getInvolves(page: number, count: number): Observable<TaskData>

  getInvolves(page?: number, count?: number) {
    return this.fetch.get(`tasks/involves`, page && count ? {
      page: page,
      count: count
    } : null)
  }

  move(_taskId: TaskId, moveOption: MoveTaskOptions): Observable<TaskData> {
    return this.fetch.put(`tasks/${_taskId}/move`, moveOption)
  }

  unarchive(_taskId: TaskId, _stageId: StageId): Observable<ArchiveTaskResponse> {
    return this.fetch.delete(`tasks/${_taskId}/archive?_stageId=${_stageId}`)
  }

  updateContent(_taskId: TaskId, content: string): Observable<UpdateContentResponse> {
    return this.fetch.put(`tasks/${_taskId}/content`, {
      content: content
    })
  }

  updateDueDate(_taskId: TaskId, dueDate: string): Observable<UpdateDueDateResponse> {
    return this.fetch.put(`tasks/${_taskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_taskId: TaskId, _executorId: UserId): Observable<UpdateExecutorResponse> {
    return this.fetch.put(`tasks/${_taskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateInvolvemembers(
    _taskId: TaskId,
    memberIds: UserId[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateInvolveMembersResponse> {
    const putData: any = Object.create(null)
    putData[type] = memberIds
    return this.fetch.put(`tasks/${_taskId}/involveMembers`, putData)
  }

  updateNote(_taskId: TaskId, note: string): Observable<UpdateNoteResponse> {
    return this.fetch.put(`tasks/${_taskId}/note`, {
      note: note
    })
  }

  updateStatus(_taskId: TaskId, status: boolean): Observable<UpdateStatusResponse> {
    return this.fetch.put(`tasks/${_taskId}/isDone`, {
      isDone: status
    })
  }

  updateSubtaskIds(_taskId: TaskId, subtaskIds: SubtaskId[]): Observable<UpdateSubtaskIdsResponse> {
    return this.fetch.put(`tasks/${_taskId}/subtaskIds`, {
      subtaskIds: subtaskIds
    })
  }

  updateTags(_taskId: TaskId, tagIds: TagId[]): Observable<UpdateTagsResponse> {
    return this.fetch.put(`tasks/${_taskId}/tagIds`, {
      tagIds: tagIds
    })
  }

}

export default new TaskFetch
