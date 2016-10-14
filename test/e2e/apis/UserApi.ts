'use strict'
import { UserApi } from 'teambition-sdk'

const expect = chai.expect

export default describe('user api test: ', () => {
  it ('get user me should ok', done => {
    UserApi.getUserMe()
      .subscribe(userMe => {
        expect(userMe._id).to.not.be.undefined
        expect(userMe.name).to.equal('Teambition FE Test')
        done()
      })
  })
})
