'use strict'
import Fetch from './BaseFetch'
import Task from '../schemas/Task'
import { visibility } from '../teambition'

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
  tasks: Task[]
  involveMembers?: string[]
  _executorId?: string
  dueDate?: string
  visiable?: visibility
}

export interface MoveTaskOptions {
  _stageId: string
  withTags?: boolean
}

export class TaskFetch extends Fetch {
  getTasksMe (option: TasksMeOptions): Promise<Task[]> {
    return this.fetch.get(`v2/tasks/me`, option)
  }

  getOrgsTasksMe(organizationId: string, option: OrgsTasksMeOptions): Promise<Task[]> {
    return this.fetch.get(`organizations/${organizationId}/tasks/me`, option)
  }

  getOrgsTasksCreated(organizationId: string, page?: number, maxId?: string): Promise<Task[]> {
    const query = this.checkQuery({
      page: page,
      maxId: maxId
    })
    return this.fetch.get(`organizations/${organizationId}/tasks/me/created`, query)
  }

  getOrgsTasksInvolves(organizationId: string, page?: number, maxId?: string): Promise<Task[]> {
    const query = this.checkQuery({
      page: page,
      maxId: maxId
    })
    return this.fetch.get(`organizations/${organizationId}/tasks/me/involves`, query)
  }

  create(createTaskData: CreateTaskOptions): Promise<Task> {
    return this.fetch.post(`tasks`, createTaskData)
  }

  get(_taskId: string): Promise<Task>

  get(_taskId: string, detailType: string): Promise<Task>

  get(_taskId: string, detailType?: string): Promise<Task> {
    return this.fetch.get(`tasks/${_taskId}`, detailType ? {
      detailType: detailType
    } : null)
  }

  getProjectTasks(_id: string, query?: any): Promise<Task[]> {
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  getProjectDoneTasks(_id: string, query: any = {}): Promise<Task[]> {
    query.isDone = true
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  update<T extends UpdateTaskOptions>(_taskId: string, updateData: T): Promise<T> {
    return this.fetch.put(`tasks/${_taskId}`, updateData)
  }

  delete(_taskId: string): Promise<{}> {
    return this.fetch.delete(`tasks/${_taskId}`)
  }

  archive(_taskId: string): Promise<{
    isArchived: boolean
    updated: string
    _id: string
    _projectId: string
  }> {
    return this.fetch.post(`tasks/${_taskId}/archive`)
  }

  batchUpdateDuedate(stageId: string, dueDate: string): Promise<{
    _stageId: string
    dueDate: string
    updated: string
  }> {
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

  favorite(_taskId: string): Promise<{
    _id: string
    updated: string
    favorite: boolean
  }> {
    return this.fetch.post(`tasks/${_taskId}/favorite`)
  }

  fork(_taskId: string, forkData: ForkTaskOptions): Promise<Task> {
    return this.fetch.put(`tasks/${_taskId}/fork`)
  }

  getByStage(_stageId: string, options?: {
    count: number
    page: number
  }): Promise<Task[]> {
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
  }): Promise<Task[]> {
    return this.fetch.get(`tasklists/${_tasklistId}/tasks`, options)
  }

  importTasks(_tasklistId: string, importData: ImportTaskOptions) {
    return this.fetch.post(`tasklists/${_tasklistId}/import_tasks`, importData)
  }

  getInvolves(): Promise<Task>

  getInvolves(page: number, count: number): Promise<Task>

  getInvolves(page?: number, count?: number) {
    return this.fetch.get(`tasks/involves`, page && count ? {
      page: page,
      count: count
    } : null)
  }

  like(_taskId: string): Promise<{
    isLike: boolean
    likesCount: number
    likesGroup: {
      _id: string
      name: string
    }[]
  }> {
    return this.fetch.post(`tasks/${_taskId}/like`)
  }

  move(_taskId: string, moveOption: MoveTaskOptions): Promise<Task> {
    return this.fetch.put(`tasks/${_taskId}/move`, moveOption)
  }

  unarchive(_taskId: string, _stageId: string): Promise<{
    isArchived: boolean
    updated: string
    _id: string
    _projectId: string
  }> {
    return this.fetch.delete(`tasks/${_taskId}/archive?_stageId=${_stageId}`)
  }

  updateContent(_taskId: string, content: string): Promise<{
    _id: string
    content: string
    updated: string
  }> {
    return this.fetch.put(`tasks/${_taskId}/content`, {
      content: content
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Promise<{
    _id: string
    updated: string
    dueDate: string
  }> {
    return this.fetch.put(`tasks/${_taskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Promise<{}> {
    return this.fetch.put(`tasks/${_taskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Promise<{}> {
    const putData: any = {}
    putData[type] = memberIds
    return this.fetch.put(`tasks/${_taskId}/involveMembers`, putData)
  }

  updateNote(_taskId: string, note: string): Promise<{
    _id: string
    updated: string
    note: string
  }> {
    return this.fetch.put(`tasks/${_taskId}/note`, {
      note: note
    })
  }

  updateStatus(_taskId: string, status: boolean): Promise<{
    _id: string
    updated: string
    isDone: boolean
  }> {
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

  updateTags(_taskId: string, tagIds: string[]): Promise<{
    _id: string
    tagIds: string[]
    updated: string
  }> {
    return this.fetch.put(`tasks/${_taskId}/tagIds`, {
      tagIds: tagIds
    })
  }

}

export default new TaskFetch()
