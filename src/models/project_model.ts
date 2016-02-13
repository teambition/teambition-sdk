'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Project from '../schemas/project_schema'
import {IProjectData} from 'teambition'

class ProjectModel extends BaseModel {
  addProjects(projects: IProjectData[]): Project[] {
    const result = datasToSchemas(projects, new Project())
    this.setCollection(`projects`, result)
    return result
  }

  getProjects(): Project[] {
    return this.getOne<Project[]>('projects')
  }
}

export default new ProjectModel()
