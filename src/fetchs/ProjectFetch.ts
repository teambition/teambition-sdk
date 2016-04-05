'use strict'
import BaseFetch from './base'
import {ProjectData} from '../teambition'

export class ProjectFetch extends BaseFetch {

  getAll(): Promise<ProjectData[]> {
    return this.fetch.get(`/projects`)
  }
}
