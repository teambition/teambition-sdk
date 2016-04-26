'use strict'
import {Observable} from 'rxjs'
import {ProjectFetch} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import Project from '../schemas/Project'

const projectFetch = new ProjectFetch()

export class ProjectsAPI {

  getAll(): Observable<Project[]> {
    const get = ProjectModel.getProjects()
    return Observable.fromPromise(projectFetch.getAll())
      .concatMap(projects => ProjectModel.addProjects(projects))
  }
}
