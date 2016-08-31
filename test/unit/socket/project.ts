import { expect } from 'chai'
import { apihost, ProjectAPI, Backend, SocketMock } from '../index'
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
    Socket = new SocketMock()
    Project = new ProjectAPI()

    httpBackend.whenGET(`${apihost}projects/${projectId}`)
      .respond(JSON.stringify(project))
  })

  // 创建新个人项目
  it('new personal project', done => {

    httpBackend.whenGET(`${apihost}projects/personal`)
      .respond([])

    httpBackend.whenGET(`${apihost}projects/${personalProject._id}`)
      .respond(JSON.stringify(personalProject))

    Project.getPersonal()
      .skip(1)
      .subscribe(projects => {
        expect(projects.length).to.equal(1)
        expectDeepEqual(projects[0], personalProject)
        done()
      })

    Socket.emit('refresh', 'project', '', personalProject._id)

    httpBackend.flush()
  })

  it('new project', done => {
    const organizationId = project._organizationId

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/projects`)
      .respond([])

    Project.getOrgs(organizationId)
      .skip(1)
      .subscribe(projects => {
        expect(projects.length).to.equal(1)
        expectDeepEqual(projects[0], project)
        done()
      })

    Socket.emit('refresh', 'project', '', projectId)

    httpBackend.flush()
  })

  // 删除个人项目
  it('delete personal project', done => {

    httpBackend.whenGET(`${apihost}projects/personal`)
      .respond(JSON.stringify(personalProjects))

    Project.getPersonal()
      .skip(1)
      .subscribe(newProjects => {
        expect(newProjects.length).to.equal(personalProjects.length - 1)
        expect(newProjects[0]._id).to.equal(personalProjects[1]._id)
        done()
      })

    Socket.emit('remove', 'project', '', personalProject._id)

    httpBackend.flush()
  })

  it('delete project', done => {
    const organizationId = project._organizationId
    const nextProjectId = projects[1]._id

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/projects`)
      .respond(JSON.stringify(projects))

    Project.getOrgs(organizationId)
      .skip(1)
      .subscribe(newProjects => {
        expect(newProjects.length).to.equal(projects.length - 1)
        expect(newProjects[0]._id).to.equal(nextProjectId)
        done()
      })

    Socket.emit('remove', 'project', '', projectId)

    httpBackend.flush()
  })

  it('new home activity', done => {
    const homeActivity = homeActivities[0]
    const projectId = homeActivity.rootId.split('#')[1]

    httpBackend
      .whenGET(`${apihost}projects/${projectId}/activities`)
      .respond([])

    Project.getHomeActivities(projectId)
      .skip(1)
      .subscribe(activities => {
        expect(activities.length).to.equal(1)
        expectDeepEqual(activities[0], homeActivity)
        done()
      })

    Socket.emit('new', 'homeActivity', projectId, homeActivity)

    httpBackend.flush()
  })
})
