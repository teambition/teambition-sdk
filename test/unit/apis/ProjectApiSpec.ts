'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { Backend, ProjectAPI, apihost, clone, assign, forEach, BaseFetch } from '../index'
import { projects } from '../../mock/projects'
import { reportSummary } from '../../mock/reportSummary'
import { reportAnalysis } from '../../mock/reportAnalysis'
import { homeActivities } from '../../mock/homeActivities'
import { expectDeepEqual, notInclude, flush } from '../utils'

const expect = chai.expect
chai.use(SinonChai)

export default describe('Project API test: ', () => {
  let httpBackend: Backend
  let Project: ProjectAPI
  let spy: Sinon.SinonSpy

  beforeEach(() => {
    flush()
    Project = new ProjectAPI()
    httpBackend = new Backend()
    spy = sinon.spy(BaseFetch.fetch, 'get')
    httpBackend
      .whenGET(`${apihost}projects`)
      .respond(JSON.stringify(projects))
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  after(() => {
    httpBackend.restore()
  })

  it('get projects should ok', done => {

    Project.getAll()
      .subscribe(projects => {
        expect(projects).to.be.instanceof(Array)
        forEach(projects, (project, pos) => {
          expectDeepEqual(project, projects[pos])
        })
        done()
      })
  })

  it('get personal projects should ok', done => {
    httpBackend.whenGET(`${apihost}projects/personal`)
      .respond(JSON.stringify([
        {
          _id: '50efadbe3b5b2c130f000009',
          _organizationId: null,
          name: 'test1'
        },
        {
          _id: '57b52a3fd40431194e5c635d',
          _organizationId: null,
          name: 'test2'
        }
      ]))
    Project.getPersonal()
      .subscribe(projects => {
        expect(projects).to.be.instanceof(Array)
        forEach(projects, (project, pos) => {
          expect(project._organizationId).to.equal(null)
        })
        done()
      })
  })

  it('get orgs projects should ok', done => {
    httpBackend.whenGET(`${apihost}organizations/test/projects`)
      .respond(JSON.stringify([
        {
          _id: 'test1',
          _organizationId: 'test',
          name: 'test1'
        },
        {
          _id: 'test2',
          _organizationId: 'test',
          name: 'test2'
        }
      ]))

    Project.getOrgs(<any>'test')
      .subscribe(r => {
        expect(r).to.be.instanceof(Array)
        done()
      })
  })

  it('get one project should ok', done => {
    const project = projects[0]
    httpBackend.whenGET(`${apihost}projects/${project._id}`)
      .respond(JSON.stringify(projects[0]))

    Project.getOne(project._id)
      .subscribe(r => {
        expectDeepEqual(r, projects[0])
        done()
      })
  })

  it('get project from cache should ok', function* () {
    const project = projects[0]
    httpBackend.whenGET(`${apihost}projects/${project._id}`)
      .respond(JSON.stringify(projects[0]))

    yield Project.getOne(project._id)
      .take(1)

    yield Project.getOne(project._id)
      .take(1)
      .do(r => {
        expect(spy).to.calledOnce
      })
  })

  it('create project should ok', function* () {

    httpBackend
      .whenPOST(`${apihost}projects`, {
        name: 'test project'
      })
      .respond({
        _id: 'test',
        name: 'test project'
      })

      const signal = Project.getAll()
        .publish()
        .refCount()

      yield signal.take(1)

      yield Project.create({
        name: 'test project'
      })

      yield signal.take(1)
        .do(r => {
          expect(r[0].name).to.equal('test project')
        })
  })

  it('update project should ok', function* () {
    const project = projects[0]
    const updatedProject = clone(project)
    const updated = new Date().toISOString()
    updatedProject.name = 'test project'
    updatedProject.updated = updated

    const mockResponse = {
      _id: project._id,
      name: 'test project',
      updated: updated
    }

    httpBackend.whenPUT(`${apihost}projects/${project._id}`, {
      name: 'test project'
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.update(project._id, {
      name: 'test project'
    })
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expectDeepEqual(r[0], updatedProject)
      })
  })

  it('delete project should ok', function* () {
    const project = projects[0]
    const length = projects.length

    httpBackend.whenDELETE(`${apihost}projects/${project._id}`)
      .respond({})

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.delete(project._id)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(length - 1)
        expect(notInclude(r, project)).to.be.true
      })
  })

  it('archive project should ok', function* () {
    const project = projects[0]
    const length = projects.length
    const mockResponse = {
      _id: project._id,
      isArchived: true,
      updated: new Date().toISOString()
    }

    httpBackend.whenPUT(`${apihost}projects/${project._id}/archive`)
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.archive(project._id)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(length - 1)
        expect(notInclude(r, project)).to.be.true
      })

  })

  it('clear read count should ok', function* () {
    const project = <any>projects[0]
    const mockResponse = {
      _id: project._id,
      unreadCount: 0,
      updated: Date.now().toString()
    }
    httpBackend.whenPUT(`${apihost}projects/${project._id}/unreadCount`)
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.clearUnreadCount(project._id)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r[0].unreadCount).to.equal(0)
      })
  })

  it('project copy should ok', function* () {
    const length = projects.length
    const project = <any>projects[0]

    httpBackend.whenPOST(`${apihost}projects/${project._id}/copy`, {
      name: 'teambition project copy test'
    })
      .respond(assign(clone(project), {
        _id: 'teambitionprojectcopytest',
        name: 'teambition project copy test'
      }))

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.copy(project._id, {
      name: 'teambition project copy test'
    })

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(length + 1)
        expect(r[0].name).to.equal('teambition project copy test')
      })
  })

  it('join project should ok', function* () {
    const projectId = <any>'#03a9f4'
    const mockProject = {
      _id: projectId,
      name: 'Blue Is the Warmest Colour'
    }
    const length = projects.length

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/join`)
      .respond({})

    httpBackend.whenGET(`${apihost}projects/${projectId}`)
      .respond(mockProject)

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.join(projectId)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(length + 1)
        expectDeepEqual(r[0], mockProject)
      })
  })

  it('quit project should ok', function* () {
    const project = <any>projects[0]
    const length = projects.length

    httpBackend.whenPUT(`${apihost}projects/${project._id}/quit`)
      .respond({})

    const signal = Project.getAll()
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.quit(project._id)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(length - 1)
        notInclude(r, project)
      })
  })

  it('set default role in project should ok', function* () {
    const project = projects[0]
    const mockResponse = {
      _id: project._id,
      _roleId: project._roleId + 1
    }

    httpBackend.whenGET(`${apihost}projects/${project._id}`)
      .respond(JSON.stringify(project))

    httpBackend.whenPUT(`${apihost}projects/${project._id}/_defaultRoleId`, {
      _roleId: project._roleId + 1
    })
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getOne(<any>project._id)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.setDefaultRole(<any>project._id, <any>project._roleId + 1)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r._roleId).to.equal(project._roleId + 1)
      })
  })

  it('star project should ok', function* () {
    const project = projects[0]
    const mockResponse = {
      _id: project._id,
      isStar: true,
      starsCount: project.starsCount + 1
    }

    httpBackend.whenGET(`${apihost}projects/${project._id}`)
      .respond(JSON.stringify(project))

    httpBackend.whenPUT(`${apihost}projects/${project._id}/star`)
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getOne(<any>project._id)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.star(<any>project._id)
      .do(r => {
        expect(r).to.deep.equal(mockResponse)
      })

    yield signal.take(1)
      .do(r => {
        expect(r.isStar).to.be.true
      })
  })

  it('unstar project should ok', function* () {
    const mockProject = clone(projects[0])
    mockProject.isStar = true
    mockProject.starsCount = mockProject.starsCount + 1
    const mockResponse = {
      _id: mockProject._id,
      isStar: false,
      starsCount: mockProject.starsCount - 1
    }

    httpBackend.whenGET(`${apihost}projects/${mockProject._id}`)
      .respond(JSON.stringify(mockProject))

    httpBackend.whenDELETE(`${apihost}projects/${mockProject._id}/star`)
      .respond(JSON.stringify(mockResponse))

    const signal = Project.getOne(<any>mockProject._id)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.unstar(<any>mockProject._id)

    yield signal.take(1)
      .do(r => {
        expect(r.isStar).to.be.false
      })
  })

  it('transfer project should ok', function* () {
    const project = projects[0]

    httpBackend.whenGET(`${apihost}projects/${project._id}`)
      .respond(JSON.stringify(project))

    httpBackend.whenPUT(`${apihost}projects/${project._id}/transfer`, {
      _organizationId: 'test'
    })
      .respond(JSON.stringify({
        _id: project._id,
        _organizationId: 'test'
      }))

    const signal = Project.getOne(<any>project._id)
      .publish()
      .refCount()

    yield signal.take(1)

    yield Project.transfer(<any>project._id, <any>'test')
      .do(r => {
        expect(r).to.deep.equal({
          _id: project._id,
          _organizationId: 'test'
        })
      })

    yield signal.take(1)
      .do(r => {
        expect(r._organizationId).to.equal('test')
      })
  })

  it('get project report summary should ok', done => {
    const projectId = projects[0]._id
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-summary`)
      .respond(JSON.stringify(reportSummary))

    Project.getReportSummary(<any>projectId)
      .subscribe(r => {
        expectDeepEqual(r, reportSummary)
        done()
      })
  })

  it('get project report summary from cache should ok', function* () {
    const projectId = projects[0]._id
    httpBackend.whenGET(`${apihost}projects/${projectId}/report-summary`)
      .respond(JSON.stringify(reportSummary))

    yield Project.getReportSummary(<any>projectId)
      .take(1)

    yield Project.getReportSummary(<any>projectId)
      .take(1)
      .do(r => {
        expectDeepEqual(r, reportSummary)
        expect(spy).to.be.calledOnce
      })
  })

  it('get project report analysis should ok', done => {
    const projectId = projects[0]._id
    const startDate = '2016-07-01'
    const endDate = '2016-08-22'

    httpBackend.whenGET(`${apihost}projects/${projectId}/analysis-report?startDate=${startDate}&endDate=${endDate}&unit=week`)
      .respond(JSON.stringify(reportAnalysis))

    Project.getAnalysisReport(<any>projectId, startDate, endDate, 'week')
      .subscribe(r => {
        expectDeepEqual(r, reportAnalysis)
        done()
      })
  })

  describe('get home activities: ', () => {

    const toIds = (...data: {_id: string}[][]) => [].concat(...data.map(data => data.map(one => one._id)))
    const projectId = homeActivities[0].rootId.split('#')[1]
    const count = 30
    const pageOne = homeActivities.slice(0, count)
    const pageTwo = homeActivities.slice(count, count * 2)

    beforeEach(() => {
      httpBackend
        .whenGET(`${apihost}projects/${projectId}/activities?page=1`)
        .respond(JSON.stringify(pageOne))
      httpBackend
        .whenGET(`${apihost}projects/${projectId}/activities?page=2`)
        .respond(JSON.stringify(pageTwo))
    })

    it('get should ok', function* () {
      const signal = Project.getHomeActivities(<any>projectId, {page: 1})
        .publish()
        .refCount()

      yield signal.take(1)

      yield Project.getHomeActivities(<any>projectId, {page: 2})
        .take(1)
        .do(r => {
          expect(toIds(r)).to.be.deep.equal(toIds(pageTwo))
        })

      yield signal.take(1)
        .do(r => {
          expect(toIds(r)).to.be.deep.equal(toIds(pageOne, pageTwo))
        })
    })

    it('get from cache should ok', function* () {
      const signal = Project.getHomeActivities(<any>projectId, {page: 1})
        .publish()
        .refCount()

      yield signal.take(1)
        .do(r => {
          expect(toIds(r)).to.be.deep.equal(toIds(pageOne))
        })

      yield signal.take(1)
        .do(r => {
          expect(toIds(r)).to.be.deep.equal(toIds(pageOne))
          expect(spy.calledOnce).to.be.true
        })
    })
  })
})
