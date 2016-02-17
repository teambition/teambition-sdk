'use strict'
import BaseAPI from './base_api'
import MemberModel from '../models/member_model'
import ProjectModel from '../models/project_model'
import Member from '../schemas/member_schema'
import Project from '../schemas/project_schema'
import {IMemberData, IProjectData} from 'teambition'

export class ProjectsAPI extends BaseAPI {

  private MemberModel = new MemberModel()
  private ProjectModel = new ProjectModel()

  getMembers(projectId: string): Promise<Member[]> {
    const cache = this.MemberModel.getProjectMembers(projectId)
    if (cache) return Promise.resolve(cache)
    return this.tbFetch.get({
      Type: 'projects',
      Id: projectId,
      Path1: 'members'
    })
    .then((members: IMemberData[]) => {
      return this.MemberModel.saveProjectMembers(projectId, members)
    })
  }

  deleteMember(memberId: string): Promise<void> {
    return this.tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
    .then(() => {
      this.MemberModel.removeMember(memberId)
    })
  }

  getAll(): Promise<Project[]> {
    const cache = this.ProjectModel.getProjects()
    if (cache) return Promise.resolve(cache)
    return this.tbFetch.get({
      Type: 'projects'
    })
    .then((projects: IProjectData[]) => {
      return this.ProjectModel.addProjects(projects)
    })
  }
}
