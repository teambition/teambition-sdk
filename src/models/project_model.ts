'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Project from '../schemas/project_schema'
import {IProjectData} from 'teambition'

export default class ProjectModel extends BaseModel {
  addProjects(projects: IProjectData[]): Project[] {
    const result = datasToSchemas(projects, new Project())
    this._save(`projects`, result)
    return result
  }

  getProjects(): Project[] {
    return this._get<Project[]>('projects')
  }
}
