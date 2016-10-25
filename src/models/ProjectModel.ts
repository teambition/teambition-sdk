'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { ProjectData, default as Project } from '../schemas/Project'
import { ProjectId, OrganizationId } from '../teambition'

export class ProjectModel extends BaseModel {

  private _schemaName = 'Project'

  addProjects(projects: ProjectData[]): Observable<ProjectData[]> {
    const result = datasToSchemas<ProjectData>(projects, Project)
    return this._saveCollection(`projects`, result, this._schemaName, (data: ProjectData) => {
      return !data.isArchived
    })
  }

  addArchivesProjects(projects: ProjectData[]): Observable<ProjectData[]> {
    const result = datasToSchemas<ProjectData>(projects, Project)
    return this._saveCollection(`archives:projects`, result, this._schemaName, data => {
      return data.isArchived
    })
  }

  addPersonalProjects(projects: ProjectData[]): Observable<ProjectData[]> {
    const result = datasToSchemas<ProjectData>(projects, Project)
    return this._saveCollection(`projects/personal`, result, this._schemaName, (data: ProjectData) => {
      return !data.isArchived && !data._organizationId
    })
  }

  addOrgsProjects(_organizationId: OrganizationId, projects: ProjectData[]): Observable<ProjectData[]> {
    const result = datasToSchemas<ProjectData>(projects, Project)
    return this._saveCollection(`orgs:projects/${_organizationId}`, result, this._schemaName, (data: ProjectData) => {
      return data._organizationId === _organizationId
    })
  }

  addOne(project: ProjectData): Observable<ProjectData> {
    const result = dataToSchema(project, Project)
    return this._save(result)
  }

  getProjects(): Observable<ProjectData[]> {
    return this._get<ProjectData[]>('projects')
  }

  getPersonalProjects(): Observable<ProjectData[]> {
    return this._get<ProjectData[]>(`projects/personal`)
  }

  getOrgProjects(_organizationId: OrganizationId): Observable<ProjectData[]> {
    return this._get<ProjectData[]>(`orgs:projects/${_organizationId}`)
  }

  getOne(_id: ProjectId): Observable<ProjectData> {
    return this._get<ProjectData>(<any>_id)
  }

  getArchivesProjects(): Observable<ProjectData[]> {
    return this._get<ProjectData[]>('archives:projects')
  }

}

export default new ProjectModel
