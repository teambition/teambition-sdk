'use strict'
import { Observable } from 'rxjs/Observable'
import { default as CustomFieldFetch, UpdateOptions, UpdateResponse } from '../fetchs/CustomFieldFetch'
import { CustomFieldData } from '../schemas/CustomField'
import CustomFieldModel from '../models/CustomFieldModel'
import TaskModel from '../models/TaskModel'
import { makeColdSignal } from './utils'
import { ProjectId, TaskId } from '../teambition'

export class CustomFieldAPI {
  getProjectCustomFields(projectId: ProjectId): Observable<CustomFieldData[]> {
    return makeColdSignal<CustomFieldData[]>(() => {
      const cache = CustomFieldModel.getCustomFields(projectId)
      if (cache) {
        return cache
      }
      return CustomFieldFetch.getProjectCustomFields(projectId)
        .concatMap(r =>
          CustomFieldModel.addCustomFields(projectId, r)
        )
    })
  }

  updateTaskCustomField(taskId: TaskId, options: UpdateOptions): Observable<UpdateResponse> {
    return makeColdSignal(() => {
      return CustomFieldFetch.updateTaskCustomField(taskId, options)
        .concatMap((resp) => {
          return TaskModel.update(taskId as string, resp)
        })
    })
  }
}

export default new CustomFieldAPI
