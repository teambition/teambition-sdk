'use strict'

import {componments} from '../component'
import {OrganizationsAPI, OrganizationData} from '../tbsdk'

const orgs = require('./orgs.html')

@componments({
  template: orgs,
  selector: 'root-componment',
  injectable: [OrganizationsAPI]
})
export class OrgComponment {

  org: OrganizationData = <any>{}

  private orgs = [
    '56988e7d05ead4ae7bb8dcf5',
    '56c3e05d550bf4c61af3ad96',
    '56c3e06c550bf4c61af3ad9a',
    '56c3e078550bf4c61af3ad9e'
  ]

  private index = 0

  constructor(private Orgs: OrganizationsAPI) {}

  changeCurrentOrg() {
    this.index = this.index + 1 > 3 ? 0 : this.index + 1
    return this.Orgs.getOne(this.orgs[this.index])
    .then((org) => {
      this.org = org
    })
  }
}
