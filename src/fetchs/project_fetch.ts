'use strict'
import BaseFetch from './base'
import {ProjectData} from '../teambition'

export class ProjectsFetch extends BaseFetch {

  getAll(): Promise<ProjectData[]> {
    return this.tbFetch.get({
      Type: 'projects'
    })
  }
}

export default new ProjectsFetch()
