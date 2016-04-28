'use strict'
import {Observable} from 'rxjs'
import BaseModel from './model'
import {datasToSchemas} from '../utils/index'
import Project from '../schemas/Project'

export class ProjectModel extends BaseModel {
  addProjects(projects: Project[]): Observable<Project[]> {
    const result = datasToSchemas<Project, Project>(projects, Project)
    return this._save(`projects`, result)
  }

  getProjects(): Observable<Project[]> {
    return this._get<Project[]>('projects')
  }
}

export default new ProjectModel()
