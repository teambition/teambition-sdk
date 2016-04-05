'use strict'
import {ProjectFetch} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import Project from '../schemas/Project'
import {ProjectData} from '../teambition'

const projectFetch = new ProjectFetch()

export class ProjectsAPI {

  public static ProjectModel = new ProjectModel()

  getAll(): Promise<Project[]> {
    return ProjectsAPI.ProjectModel.getProjects()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return projectFetch
        .getAll()
        .then((projects: ProjectData[]) => {
          return ProjectsAPI.ProjectModel.addProjects(projects)
        })
    })
  }
}
