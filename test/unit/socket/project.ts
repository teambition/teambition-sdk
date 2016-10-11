import { expect } from 'chai'
import { apihost, ProjectAPI, Backend, SocketMock, SocketClient } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { projects } from '../../mock/projects'
import { homeActivities } from '../../mock/homeActivities'

export default describe('project socket test', () => {

  let httpBackend: Backend
  let Socket: SocketMock
  let Project: ProjectAPI

  const project = projects[0]
  const projectId = project._id
  const personalProjects = projects.filter(project => project._organizationId === null)
  const personalProject = personalProjects[0]

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient)
    Project = new ProjectAPI()

    httpBackend.whenGET(`${apihost}projects/${projectId}`)
      .respond(JSON.stringify(project))
  })

  // 创建新个人项目
  it('new personal project', function* () {

    httpBackend.whenGET(`${apihost}projects/personal`)
      .respond([])

    httpBackend.whenGET(`${apihost}projects/${personalProject._id}`)
      .respond(JSON.stringify(personalProject))

    const signal = Project.getPersonal()
      .publish()
      .refCount()

    yield Socket.emit('refresh', 'project', '', personalProject._id, signal.take(1))

    yield signal.take(1)
      .do(projects => {
        expect(projects.length).to.equal(1)
        expectDeepEqual(projects[0], personalProject)
      })
  })

  it('new project', function* () {
    const organizationId = project._organizationId

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/projects`)
      .respond([])

    const signal = Project.getOrgs(organizationId)
      .publish()
      .refCount()

    yield Socket.emit('refresh', 'project', '', projectId, signal.take(1))

    yield signal.take(1)
      .do(projects => {
        expect(projects.length).to.equal(1)
        expectDeepEqual(projects[0], project)
      })
  })

  // 删除个人项目
  it('delete personal project', function* () {

    httpBackend.whenGET(`${apihost}projects/personal`)
      .respond(JSON.stringify(personalProjects))

    const signal = Project.getPersonal()
      .publish()
      .refCount()

    yield Socket.emit('remove', 'project', '', personalProject._id, signal.take(1))

    yield signal.take(1)
      .do(newProjects => {
        expect(newProjects.length).to.equal(personalProjects.length - 1)
        expect(newProjects[0]._id).to.equal(personalProjects[1]._id)
      })
  })

  it('delete project', function* () {
    const organizationId = project._organizationId
    const nextProjectId = projects[1]._id

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/projects`)
      .respond(JSON.stringify(projects))

    const signal = Project.getOrgs(organizationId)
      .publish()
      .refCount()

    yield Socket.emit('remove', 'project', '', projectId, signal.take(1))

    yield signal.take(1)
      .do(newProjects => {
        expect(newProjects.length).to.equal(projects.length - 1)
        expect(newProjects[0]._id).to.equal(nextProjectId)
      })
  })

  it('new home activity', function* () {
    const homeActivity = homeActivities[0]
    const projectId = homeActivity.rootId.split('#')[1]

    httpBackend
      .whenGET(`${apihost}projects/${projectId}/activities`)
      .respond([])

    const signal = Project.getHomeActivities(projectId)
      .publish()
      .refCount()

    yield Socket.emit('new', 'homeActivity', '', homeActivity, signal.take(1))

    yield signal.take(1)
      .do(activities => {
        expect(activities.length).to.equal(1)
        expectDeepEqual(activities[0], homeActivity)
      })
  })
})
