'use strict'
import Fetch from './BaseFetch'
import { TaskData } from '../schemas/Task'
import { visibility, ExecutorOrCreator, FavoriteResponse, LikeResponse } from '../teambition'

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

export interface OrgsTasksMeOptions {
  hasDuedate?: boolean
  page: number
  isDone: boolean
}

export interface CreateTaskOptions {
  content: string
  _tasklistId: string
  _stageId?: string
  _executorId?: string
  involveMembers?: string[]
  dueDate?: string
  priority?: '0' | '1' | '2'
  recurrence?: string
  tagIds?: string[]
}

export interface UpdateTaskOptions {
  _executorId?: string
  _projectId?: string
  _tasklistId?: string
  tagsId?: string[]
  _stageId?: string
  involveMembers?: string[]
  isDone?: boolean
  priority?: number
  dueDate?: string
  note?: string
  content?: string
  recurrence?: string[]
  tasklist?: string
}

export interface ForkTaskOptions {
  _stageId: string
  doLink?: boolean
  doLinked?: boolean
}

export interface ImportTaskOptions {
  _stageId?: string
  tasks: TaskData[]
  involveMembers?: string[]
  _executorId?: string
  dueDate?: string
  visiable?: visibility
}

export interface MoveTaskOptions {
  _stageId: string
  withTags?: boolean
}

export interface GetStageTasksOptions {
  isDone?: boolean
  _executorId?: string
  dueDate?: string
  accomplished?: string
  all?: boolean
  limit?: number
  page?: number
}

export interface BatchUpdateDuedateResponse {
  _stageId: string
  dueDate: string
  updated: string
}

export interface ArchiveTaskResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface UpdateNoteResponse {
  _id: string
  updated: string
  note: string
}

export interface UpdateTagsResponse {
  _id: string
  tagIds: string[]
  updated: string
}

export interface UpdateStatusResponse {
  _id: string
  updated: string
  isDone: boolean
}

export interface UpdateContentResponse {
  _id: string
  content: string
  updated: string
}

export interface UpdateDueDateResponse {
  _id: string
  updated: string
  dueDate: string
}

export interface UpdateExecutorResponse {
  _executorId: string
  _id: string
  executor: ExecutorOrCreator
  involveMembers?: string[]
  updated: string
}

export class TaskFetch extends Fetch {
  getTasksMe (option: TasksMeOptions): Promise<TaskData[]> {
    return this.fetch.get(`v2/tasks/me`, option)
  }

  getOrgsTasksMe(organizationId: string, option: OrgsTasksMeOptions): Promise<TaskData[]> {
    return this.fetch.get(`organizations/${organizationId}/tasks/me`, option)
  }

  getOrgsTasksCreated(organizationId: string, page?: number, maxId?: string): Promise<TaskData[]> {
    const query = this.checkQuery({
      page: page,
      maxId: maxId
    })
    return this.fetch.get(`organizations/${organizationId}/tasks/me/created`, query)
  }

  getOrgsTasksInvolves(organizationId: string, page?: number, maxId?: string): Promise<TaskData[]> {
    const query = this.checkQuery({
      page: page,
      maxId: maxId
    })
    return this.fetch.get(`organizations/${organizationId}/tasks/me/involves`, query)
  }

  create(createTaskData: CreateTaskOptions): Promise<TaskData> {
    return this.fetch.post(`tasks`, createTaskData)
  }

  get(_taskId: string): Promise<TaskData>

  get(_taskId: string, detailType: string): Promise<TaskData>

  get(_taskId: string, detailType?: string): Promise<TaskData> {
    return this.fetch.get(`tasks/${_taskId}`, detailType ? {
      detailType: detailType
    } : null)
  }

  getStageTasks(stageId: string, query?: any): Promise<TaskData[]> {
    return this.fetch.get(`stages/${stageId}/tasks`, query)
  }

  getStageDoneTasks(stageId: string, query: any = {}): Promise<TaskData[]> {
    query.isDone = true
    return this.fetch.get(`stages/${stageId}/tasks`, query)
  }

  getProjectTasks(_id: string, query?: any): Promise<TaskData[]> {
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  getProjectDoneTasks(_id: string, query: any = {}): Promise<TaskData[]> {
    query.isDone = true
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  update<T extends UpdateTaskOptions>(_taskId: string, updateData: T): Promise<T> {
    return this.fetch.put(`tasks/${_taskId}`, updateData)
  }

  delete(_taskId: string): Promise<{}> {
    return this.fetch.delete(`tasks/${_taskId}`)
  }

  archive(_taskId: string): Promise<ArchiveTaskResponse> {
    return this.fetch.post(`tasks/${_taskId}/archive`)
  }

  batchUpdateDuedate(stageId: string, dueDate: string): Promise<BatchUpdateDuedateResponse> {
    return this.fetch.put(`stages/${stageId}/tasks/dueDate`, {
      dueDate: dueDate
    })
  }

  batchUpdateExecutor(stageId: string, _executorId: string): Promise<{
    _stageId: string
    updated: string
    _executorId: string
  }> {
    return this.fetch.put(`stages/${stageId}/tasks/executor`)
  }

  batchUpdateVisibility(stageId: string, visible: 'members' | 'involves'): Promise<{
    _stageId: string
    updated: string
    visible: string
  }> {
    return this.fetch.put(`stages/${stageId}/tasks/visible`)
  }

  favorite(_taskId: string): Promise<FavoriteResponse> {
    return this.fetch.post(`tasks/${_taskId}/favorite`)
  }

  fork(_taskId: string, forkData: ForkTaskOptions): Promise<TaskData> {
    return this.fetch.put(`tasks/${_taskId}/fork`, forkData)
  }

  getByStage(_stageId: string, options?: {
    count: number
    page: number
  }): Promise<TaskData[]> {
    return this.fetch.get(`stages/${_stageId}/tasks`, options)
  }

  getByTasklist(_tasklistId: string, options: {
    isDone?: boolean
    _executorId?: string
    dueDate?: string
    accomplished?: string
    all?: boolean
    limit?: number
    page?: number
    dumpType?: 'json' | 'excel'
  }): Promise<TaskData[]> {
    return this.fetch.get(`tasklists/${_tasklistId}/tasks`, options)
  }

  importTasks(_tasklistId: string, importData: ImportTaskOptions) {
    return this.fetch.post(`tasklists/${_tasklistId}/import_tasks`, importData)
  }

  getInvolves(): Promise<TaskData>

  getInvolves(page: number, count: number): Promise<TaskData>

  getInvolves(page?: number, count?: number) {
    return this.fetch.get(`tasks/involves`, page && count ? {
      page: page,
      count: count
    } : null)
  }

  like(_taskId: string): Promise<LikeResponse> {
    return this.fetch.post(`tasks/${_taskId}/like`)
  }

  move(_taskId: string, moveOption: MoveTaskOptions): Promise<TaskData> {
    return this.fetch.put(`tasks/${_taskId}/move`, moveOption)
  }

  unarchive(_taskId: string, _stageId: string): Promise<ArchiveTaskResponse> {
    return this.fetch.delete(`tasks/${_taskId}/archive?_stageId=${_stageId}`)
  }

  updateContent(_taskId: string, content: string): Promise<UpdateContentResponse> {
    return this.fetch.put(`tasks/${_taskId}/content`, {
      content: content
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Promise<UpdateDueDateResponse> {
    return this.fetch.put(`tasks/${_taskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Promise<UpdateExecutorResponse> {
    return this.fetch.put(`tasks/${_taskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Promise<{}> {
    const putData: any = Object.create(null)
    putData[type] = memberIds
    return this.fetch.put(`tasks/${_taskId}/involveMembers`, putData)
  }

  updateNote(_taskId: string, note: string): Promise<UpdateNoteResponse> {
    return this.fetch.put(`tasks/${_taskId}/note`, {
      note: note
    })
  }

  updateStatus(_taskId: string, status: boolean): Promise<UpdateStatusResponse> {
    return this.fetch.put(`tasks/${_taskId}/isDone`, {
      isDone: status
    })
  }

  updateSubtaskIds(_taskId: string, subtaskIds: string[]): Promise<{
    subtaskIds: string[]
  }> {
    return this.fetch.put(`tasks/${_taskId}/subtaskIds`, {
      subtaskIds: subtaskIds
    })
  }

  updateTags(_taskId: string, tagIds: string[]): Promise<UpdateTagsResponse> {
    return this.fetch.put(`tasks/${_taskId}/tagIds`, {
      tagIds: tagIds
    })
  }

}

export default new TaskFetch()
