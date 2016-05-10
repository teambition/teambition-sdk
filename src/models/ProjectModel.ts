'use strict'
import {Observable} from 'rxjs'
import BaseModel from './model'
import {datasToSchemas, dataToSchema} from '../utils/index'
import Project from '../schemas/Project'

export class ProjectModel extends BaseModel<Project> {

  addProjects(projects: Project[]): Observable<Project[]> {
    const result = datasToSchemas<Project, Project>(projects, Project)
    return this._saveCollection(`projects`, result, (data: Project) => {
      return !data.isArchived
    })
  }

  addArchivesProjects(projects: Project[]): Observable<Project[]> {
    const result = datasToSchemas<Project, Project>(projects, Project)
    return this._saveCollection(`archives:projects`, result, (data: Project) => {
      return data.isArchived
    })
  }

  addOrgsProjects(_organizationId: string, projects: Project[]): Observable<Project[]> {
    return this._saveCollection(`orgs:projects/${_organizationId}`, projects, (data: Project) => {
      return data._organizationId === _organizationId
    })
  }

  getProjects(): Observable<Project[]> {
    return this._get<Project[]>('projects')
  }

  getOrgProjects(_organizationId: string) {
    return this._get<Project[]>(`orgs:projects/${_organizationId}`)
  }

  getOne(_id: string): Observable<Project> {
    return this._get<Project>(_id)
  }

  getArchivesProjects(): Observable<Project[]> {
    return this._get<Project[]>('archives:projects')
  }

  archiveProject(_id: string) {
    const namespace = 'archives:projects'
    const save = this._saveToCollection(_id, namespace)
    const remove = this._removeFromCollection(_id, namespace)
    return Observable.from([save, remove])
      .mergeAll()
      .skip(1)
  }

  addProject(project: Project): Observable<Project> {
    const result = dataToSchema<Project, Project>(project, Project)
    return this._saveToCollection(project._id, 'projects', result)
  }

  updateProject(project: Project): Observable<Project> {
    return this._update<Project>(project._id, project)
  }

  deleteProject(_id: string): Observable<void> {
    return this._delete(_id)
  }

}

export default new ProjectModel()
