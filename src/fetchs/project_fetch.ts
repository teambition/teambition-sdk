'use strict'
import BaseFetch from './base'
import {ProjectData} from '../teambition'

export class ProjectsFetch extends BaseFetch {

  getAll(): Promise<ProjectData[]> {
    return this.fetch.get(`/projects`)
  }
}

export default new ProjectsFetch()
