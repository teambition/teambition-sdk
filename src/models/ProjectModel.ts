'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { ProjectData, default as Project } from '../schemas/Project'

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
    return this._saveCollection(`archives:projects`, result, this._schemaName, (data: ProjectData) => {
      return data.isArchived
    })
  }

  addOrgsProjects(_organizationId: string, projects: ProjectData[]): Observable<ProjectData[]> {
    return this._saveCollection(`orgs:projects/${_organizationId}`, projects, this._schemaName, (data: ProjectData) => {
      return data._organizationId === _organizationId
    })
  }

  addOne(project: ProjectData): Observable<ProjectData> {
    const result = dataToSchema<ProjectData>(project, Project)
    return this._save(result)
  }

  getProjects(): Observable<ProjectData[]> {
    return this._get<ProjectData[]>('projects')
  }

  getOrgProjects(_organizationId: string): Observable<ProjectData[]> {
    return this._get<ProjectData[]>(`orgs:projects/${_organizationId}`)
  }

  getOne(_id: string): Observable<ProjectData> {
    return this._get<ProjectData>(_id)
  }

  getArchivesProjects(): Observable<ProjectData[]> {
    return this._get<ProjectData[]>('archives:projects')
  }

}

export default new ProjectModel()
