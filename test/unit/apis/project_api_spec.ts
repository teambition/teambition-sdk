'use strict'
import * as chai from 'chai'
import {Backend, ProjectsAPI} from '../index'
import {apihost} from '../app'
import {projects} from '../mock'

const expect = chai.expect

const Project = new ProjectsAPI()

export default describe('Project API test', () => {
  let httpBackend: Backend
  beforeEach(() => {
    httpBackend = new Backend()
  })

  it('get projects should ok', done => {
    httpBackend
      .whenGET(`${apihost}/projects`)
      .respond(projects)

    Project.getAll()
      .then(projects => {
        expect(projects).to.be.instanceof(Array)
        done()
      })
    httpBackend.flush()
  })
})
