'use strict'
import { UserAPI } from 'teambition-sdk'

const expect = chai.expect
const userApi = new UserAPI()

export default describe('user api test: ', () => {
  it ('get user me should ok', done => {
    userApi.getUserMe()
      .subscribe(userMe => {
        expect(userMe._id).to.not.be.undefined
        expect(userMe.name).to.equal('Teambition FE Test')
        done()
      })
  })
})
