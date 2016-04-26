'use strict'
import BaseFetch from './base'
import Project from '../schemas/Project'

export class ProjectFetch extends BaseFetch {

  getAll(): Promise<Project[]> {
    return this.fetch.get(`/projects`)
  }
}
