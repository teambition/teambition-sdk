'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Project from '../schemas/project_schema'
import {IProjectData} from 'teambition'

export default class ProjectModel extends BaseModel {
  addProjects(projects: IProjectData[]): Promise<Project[]> {
    const result = datasToSchemas<IProjectData, Project>(projects, Project)
    return this._save(`projects`, result).then(() => {
      return result
    })
  }

  getProjects(): Promise<Project[]> {
    return this._get<Project[]>('projects')
  }
}
