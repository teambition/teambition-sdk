'use strict'
import BaseAPI from './base_api'
import ProjectModel from '../models/project_model'
import Project from '../schemas/project_schema'
import {ProjectData} from '../teambition'

export class ProjectsAPI extends BaseAPI {

  public static ProjectModel = new ProjectModel()

  getAll(): Promise<Project[]> {
    return ProjectsAPI.ProjectModel.getProjects()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'projects'
      })
      .then((projects: ProjectData[]) => {
        return ProjectsAPI.ProjectModel.addProjects(projects)
      })
    })
  }
}
