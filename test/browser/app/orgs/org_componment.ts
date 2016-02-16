'use strict'

import {componments} from '../componment'
import {OrganizationAPI} from '../index'
import {IOrganizationData} from 'teambition'

const orgs = require('./orgs.html')

@componments({
  template: orgs,
  selector: 'main-app',
  injectable: [OrganizationAPI]
})
class OrgComponment {

  org: IOrganizationData = <any>{}

  private orgs = [
    '50c32afae8cf1439d35a87e6',
    '554c83b1b2c809b4715d17b0',
    '554b34ebda7c08b51fcbafa3',
    '55cb47d8b5413ffe588a60ea',
    '55cc2ac25f92dc6074ea4030'
  ]

  private index = 0

  constructor(private Orgs: typeof OrganizationAPI) {}

  changeCurrentOrg() {
    this.index = this.index + 1 > 4 ? 0 : this.index + 1
    this.Orgs.getOne(this.orgs[this.index])
    .then((org) => {
      this.org = org
    })
  }
}
