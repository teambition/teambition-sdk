'use strict'
import ProjectFetch from '../fetchs/project_fetch'
import ProjectModel from '../models/project_model'
import Project from '../schemas/project_schema'
import {ProjectData} from '../teambition'

export class ProjectsAPI {

  public static ProjectModel = new ProjectModel()

  getAll(): Promise<Project[]> {
    return ProjectsAPI.ProjectModel.getProjects()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return ProjectFetch
        .getAll()
        .then((projects: ProjectData[]) => {
          return ProjectsAPI.ProjectModel.addProjects(projects)
        })
    })
  }
}
