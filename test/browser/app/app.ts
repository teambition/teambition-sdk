'use strict'
import {componments} from './componment'
import {UserComponment} from './userme/user_componment'
import {OrgComponment} from './orgs/org_componment'
import {Fetch} from '../../../src/app'
import {bootstrap} from './bootstrap'
Fetch.setAPIHost('http://project.ci/api')

require('../index.html')

@componments({
  template: require('./root.html'),
  selector: 'main-app',
  childNodes: [OrgComponment, UserComponment]
})
class App {}

bootstrap(App)
