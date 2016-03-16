'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Project from '../schemas/project_schema'
import {ProjectData} from '../teambition'

export default class ProjectModel extends BaseModel {
  addProjects(projects: ProjectData[]): Promise<Project[]> {
    const result = datasToSchemas<ProjectData, Project>(projects, Project)
    return this._save(`projects`, result).then(() => {
      return result
    })
  }

  getProjects(): Promise<Project[]> {
    return this._get<Project[]>('projects')
  }
}
