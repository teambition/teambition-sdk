import { TaskDivisionType, TaskId } from 'teambition-types'
import { TaskSchema } from '../../schemas'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

interface UpdateTaskDivisionsResponse {
  divisions: TaskDivisionType[]
}

function updateTaskDivisionsFetch(
  this: SDKFetch,
  taskId: TaskId,
  divisions: TaskDivisionType[]
) {
  const url = `tasks/${taskId}/divisions`
  const body = { divisions: divisions }

  return this.put<UpdateTaskDivisionsResponse>(url, body)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateTaskDivisions: typeof updateTaskDivisionsFetch
  }
}

SDKFetch.prototype.updateTaskDivisions = updateTaskDivisionsFetch

function updateTaskDivisions(
  this: SDK,
  taskId: TaskId,
  divisions: TaskDivisionType[]
) {
  const req = this.fetch.updateTaskDivisions(taskId, divisions).map(
    (resp): Partial<TaskSchema> => {
      return { ...resp, _id: taskId }
    }
  )

  return this.lift({
    tableName: 'Task',
    method: 'update',
    request: req,
    clause: { _id: taskId }
  })
}

declare module '../../SDK' {
  interface SDK {
    updateTaskDivisions: typeof updateTaskDivisions
  }
}

SDK.prototype.updateTaskDivisions = updateTaskDivisions
