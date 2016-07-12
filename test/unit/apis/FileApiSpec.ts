'use strict'
import * as chai from 'chai'
import { FileAPI, apihost, Backend } from '../index'
import { flush } from '../utils'

const expect = chai.expect

export default describe('FileAPI test: ', () => {
  let httpBackend: Backend
  let Files: FileAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Files = new FileAPI()

    httpBackend.whenPOST(`https://striker.teambition.net/upload`, {})
      .respond({
        fileCategory: 'image',
        fileKey: '110hcfa32d32265b1bacb3d5e5284492ac27',
        fileName: 'e0822cc019.jpeg',
        fileSize: 1305757,
        fileType: 'jpeg'
      })

    httpBackend.whenGET(`${apihost}users/me`)
      .respond({
        strikerAuth: 'Striker Auth Mock'
      })
  })

  it('create file should ok', done => {
    httpBackend.whenPOST(`${apihost}works`, {
      _parentId: '111',
      works: [
        {
          fileCategory: 'image',
          fileKey: '110hcfa32d32265b1bacb3d5e5284492ac27',
          fileName: 'e0822cc019.jpeg',
          fileSize: 1305757,
          fileType: 'jpeg'
        }
      ]
    }).respond([{
      _id: 'filemocktest',
      _parentId: '111'
    }])

    Files.create(<any>{}, '111')
      .subscribe(data => {
        expect(data._id).to.equal('filemocktest')
        expect(data._parentId).to.equal('111')
        done()
      })

    httpBackend.flush()
  })
})
