'use strict'
import { Scheduler } from 'rxjs'
import * as chai from 'chai'
import { Backend, ProjectAPI, apihost, clone, assign, forEach } from '../index'
import { projects } from '../../mock/projects'
import { expectDeepEqual, notInclude, flush } from '../utils'

const expect = chai.expect

export default describe('Project API test', () => {
  let httpBackend: Backend
  let Project: ProjectAPI

  beforeEach(() => {
    flush()
    Project = new ProjectAPI()
    httpBackend = new Backend()
    httpBackend
      .whenGET(`${apihost}projects`)
      .respond(JSON.stringify(projects))
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

    httpBackend.flush()
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

    Project.getOrgs('test')
      .subscribe(r => {
        expect(r).to.be.instanceof(Array)
        done()
      })

    httpBackend.flush()
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

    httpBackend.flush()
  })

  it('create project should ok', done => {

    httpBackend
      .whenPOST(`${apihost}projects`, {
        name: 'test project'
      })
      .respond({
        _id: 'test',
        name: 'test project'
      })

      Project.getAll()
        .skip(1)
        .subscribe(r => {
          expect(r[0].name).to.equal('test project')
          done()
        })

      Project.create({
        name: 'test project'
      })
        .subscribeOn(Scheduler.async, global.timeout1)
        .subscribe()

    httpBackend.flush()
  })

  it('update project should ok', done => {
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

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expectDeepEqual(r[0], updatedProject)
      })

    Project.update(project._id, {
      name: 'test project'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })

    httpBackend.flush()
  })

  it('delete project should ok', done => {
    const project = projects[0]
    const length = projects.length

    httpBackend.whenDELETE(`${apihost}projects/${project._id}`)
      .respond({})

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(length - 1)
        expect(notInclude(r, project)).to.be.true
        done()
      })

    Project.delete(project._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('archive project should ok', done => {
    const project = projects[0]
    const length = projects.length
    const mockResponse = {
      _id: project._id,
      isArchived: true,
      updated: new Date().toISOString()
    }

    httpBackend.whenPUT(`${apihost}projects/${project._id}/archive`)
      .respond(JSON.stringify(mockResponse))

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(length - 1)
        expect(notInclude(r, project)).to.be.true
      })

    Project.archive(project._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })

    httpBackend.flush()

  })

  it('clear read count should ok', done => {
    const project = projects[0]
    const mockResponse = {
      _id: project._id,
      unreadCount: 0,
      updated: Date.now().toString()
    }
    httpBackend.whenPUT(`${apihost}projects/${project._id}/unreadCount`)
      .respond(JSON.stringify(mockResponse))

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r[0].unreadCount).to.equal(0)
      })

    Project.clearUnreadCount(project._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })

    httpBackend.flush()
  })

  it('project copy should ok', done => {
    const length = projects.length
    const project = projects[0]

    httpBackend.whenPOST(`${apihost}projects/${project._id}/copy`, {
      name: 'teambition project copy test'
    })
      .respond(assign(clone(project), {
        _id: 'teambitionprojectcopytest',
        name: 'teambition project copy test'
      }))

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(length + 1)
        expect(r[0].name).to.equal('teambition project copy test')
        done()
      })

    Project.copy(project._id, {
      name: 'teambition project copy test'
    })
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('join project should ok', done => {
    const mockProject = {
      _id: '03a9f4',
      name: 'Blue Is the Warmest Colour'
    }
    const length = projects.length

    httpBackend.whenPOST(`${apihost}v2/projects/03a9f4/join`)
      .respond({})

    httpBackend.whenGET(`${apihost}projects/03a9f4`)
      .respond(mockProject)

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(length + 1)
        expectDeepEqual(r[0], mockProject)
        done()
      })

    Project.join('03a9f4')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('quit project should ok', done => {
    const project = projects[0]
    const length = projects.length

    httpBackend.whenPUT(`${apihost}projects/${project._id}/quit`)
      .respond({})

    Project.getAll()
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(length - 1)
        notInclude(r, project)
        done()
      })

    Project.quit(project._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('set default role in project should ok', done => {
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

    Project.getOne(project._id)
      .skip(1)
      .subscribe(r => {
        expect(r._roleId).to.equal(project._roleId + 1)
      })

    Project.setDefaultRole(project._id, project._roleId + 1)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })

    httpBackend.flush()
  })

  it('star project should ok', done => {
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

    Project.getOne(project._id)
      .skip(1)
      .subscribe(r => {
        expect(r.isStar).to.be.true
        expect(r.starsCount).to.equal(project.starsCount + 1)
      })

    Project.star(project._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal(mockResponse)
        done()
      })

    httpBackend.flush()
  })

  it('unstar project should ok', done => {
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

    Project.getOne(mockProject._id)
      .skip(1)
      .subscribe(r => {
        expect(r.isStar).to.be.false
        done()
      })

    Project.unstar(mockProject._id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('transfer project should ok', done => {
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

    Project.getOne(project._id)
      .skip(1)
      .subscribe(r => {
        expect(r._organizationId).to.equal('test')
      })

    Project.transfer(project._id, 'test')
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(r => {
        expect(r).to.deep.equal({
          _id: project._id,
          _organizationId: 'test'
        })
        done()
      })

    httpBackend.flush()
  })
})
