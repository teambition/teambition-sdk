'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { CustomFieldData } from '../schemas/CustomField'
import { ProjectId, CustomFieldType, CustomFieldId, TaskId } from '../teambition'

export interface CreateOption {
  name?: string
  type: CustomFieldType
  _projectId: ProjectId
  choices?: { [key: string]: string }[]
}

export interface UpdateOptions {
  values: string[]
  _customfieldId: CustomFieldId
}

export interface SimpleCustomField {
  type: CustomFieldType
  values: string[]
  _customfieldId: CustomFieldId
}

export interface UpdateResponse {
  customfields: SimpleCustomField[]
}

export class CustomFieldFetch extends BaseFetch {

  getProjectCustomFields(projectId: ProjectId): Observable<CustomFieldData[]> {
    return this.fetch.get(`customfields?_projectId=${projectId}`)
  }

  createProjectCustomField(options: CreateOption): Observable<CustomFieldData> {
    return this.fetch.post('customfields', options)
  }

  deleteProjectCustomField(customfieldId: CustomFieldId): Observable<any> {
    return this.fetch.delete(`customfields/${customfieldId}`)
  }

  updateProjectCustomFieldsOrder(
    customfieldId: CustomFieldId, options: {
      _nextId: string
    }): Observable<{ id: CustomFieldId, updated?: string, pos?: string }> {
    return this.fetch.put(`customfields/${customfieldId}/move`, options)
  }

  updateProjectCustomFieldDisplay(
    customfieldId: CustomFieldId,
    options: {
      display: boolean
    }): Observable<{ id: CustomFieldId, updated?: string, display: boolean }> {
    return this.fetch.put(`customfields/${customfieldId}/displayed`, options)
  }

  updateProjectSingelCustomFieldPermission(
    customfieldId: CustomFieldId,
    options: { _roleIds: string[] }
  ): Observable<{ id: CustomFieldId, updated?: string, _roleIds: string[] }> {
    return this.fetch.put(`customfields/${customfieldId}/_roleIds`, options)
  }

  updateTaskCustomField(taskId: TaskId, options: UpdateOptions): Observable<UpdateResponse> {
    return this.fetch.put<UpdateResponse>(`tasks/${taskId}/customfields`, options)
  }
}
export default new CustomFieldFetch
