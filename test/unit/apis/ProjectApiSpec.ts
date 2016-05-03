'use strict'
import * as chai from 'chai'
import {Backend, ProjectsAPI, apihost} from '../index'
import {projects} from '../mock/projects'
import {flushDatabase} from '../utils'

const expect = chai.expect

const Project = new ProjectsAPI()

export default describe('Project API test', () => {
  let httpBackend: Backend
  beforeEach(() => {
    flushDatabase()
    httpBackend = new Backend()
  })

  it('get projects should ok', done => {
    httpBackend
      .whenGET(`${apihost}projects`)
      .respond(projects)

    Project.getAll()
      .subscribe(projects => {
        expect(projects).to.be.instanceof(Array)
        done()
      })
    httpBackend.flush()
  })
})
