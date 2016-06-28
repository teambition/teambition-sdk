'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import { datasToSchemas, dataToSchema } from '../utils/index'
import Project from '../schemas/Project'

export class ProjectModel extends BaseModel {

  private _schemaName = 'Project'

  addProjects(projects: Project[]): Observable<Project[]> {
    const result = datasToSchemas<Project>(projects, Project)
    return this._saveCollection(`projects`, result, this._schemaName, (data: Project) => {
      return !data.isArchived
    })
  }

  addArchivesProjects(projects: Project[]): Observable<Project[]> {
    const result = datasToSchemas<Project>(projects, Project)
    return this._saveCollection(`archives:projects`, result, this._schemaName, (data: Project) => {
      return data.isArchived
    })
  }

  addOrgsProjects(_organizationId: string, projects: Project[]): Observable<Project[]> {
    return this._saveCollection(`orgs:projects/${_organizationId}`, projects, this._schemaName, (data: Project) => {
      return data._organizationId === _organizationId
    })
  }

  addOne(project: Project): Observable<Project> {
    const result = dataToSchema<Project>(project, Project)
    return this._save(result)
  }

  getProjects(): Observable<Project[]> {
    return this._get<Project[]>('projects')
  }

  getOrgProjects(_organizationId: string): Observable<Project[]> {
    return this._get<Project[]>(`orgs:projects/${_organizationId}`)
  }

  getOne(_id: string): Observable<Project> {
    return this._get<Project>(_id)
  }

  getArchivesProjects(): Observable<Project[]> {
    return this._get<Project[]>('archives:projects')
  }

  update(project: any): Observable<Project> {
    return super.update<Project>(project._id, project)
  }

}

export default new ProjectModel()
