'use strict'
import { Observable } from 'rxjs/Observable'
import {
  default as CustomFieldFetch,
  UpdateOption,
  UpdateResponse
} from '../fetchs/CustomFieldFetch'
import { CustomFieldData } from '../schemas/CustomField'
import CustomFieldModel from '../models/CustomFieldModel'
import { makeColdSignal } from './utils'
import { ProjectId } from '../teambition'

export class CustomFieldApi {
  getProjectCustomFields(projectId: ProjectId): Observable<CustomFieldData[]> {
    return makeColdSignal<CustomFieldData[]>(() => {
      const cache = CustomFieldModel.getCustomFields(projectId)
      if (cache) {
        return cache
      }
      return CustomFieldFetch.getProjectCustomFields(projectId).concatMap(r =>
        CustomFieldModel.addCustomFields(projectId, r)
      )
    })
  }

  updateTaskCustomField(option: UpdateOption): Observable<UpdateResponse> {
    return CustomFieldFetch.updateTaskCustomField(option)
  }
}

export default new CustomFieldApi()
