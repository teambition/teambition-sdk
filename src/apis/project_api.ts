'use strict'
import BaseAPI from './base_api'
import ProjectModel from '../models/project_model'
import Project from '../schemas/project_schema'
import {IProjectData} from 'teambition'

export class ProjectsAPI extends BaseAPI {

  private ProjectModel = new ProjectModel()

  getAll(): Promise<Project[]> {
    return this.ProjectModel.getProjects()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'projects'
      })
      .then((projects: IProjectData[]) => {
        return this.ProjectModel.addProjects(projects)
      })
    })
  }
}
