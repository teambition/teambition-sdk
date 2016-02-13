'use strict'
import {tbFetch} from '../utils/fetch'
import MemberModel from '../models/member_model'
import ProjectModel from '../models/project_model'
import Member from '../schemas/member_schema'
import Project from '../schemas/project_schema'
import {IMemberData, IProjectData} from 'teambition'

export const ProjectAPI = {
  getMembers(projectId: string): Promise<Member[]> {
    const cache = MemberModel.getProjectMembers(projectId)
    return cache ?
    new Promise<Member[]>((resolve, reject) => {
      resolve(cache)
    }) :
    tbFetch.get({
      Type: 'projects',
      Id: projectId,
      Path1: 'members'
    })
    .then((members: IMemberData[]) => {
      return MemberModel.addProjectMembers(projectId, members)
    })
  },

  deleteMember(memberId: string): Promise<void> {
    return tbFetch.delete({
      Type: 'members',
      Id: memberId
    })
    .then(() => {
      MemberModel.removeMember(memberId)
    })
  },

  getAll(): Promise<Project[]> {
    const cache = ProjectModel.getProjects()
    return cache ?
    new Promise((resolve, reject) => {
      resolve(cache)
    }) :
    tbFetch.get({
      Type: 'projects'
    })
    .then((projects: IProjectData[]) => {
      return ProjectModel.addProjects(projects)
    })
  }
}
