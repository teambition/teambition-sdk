'use strict'
import 'isomorphic-fetch'

process.env.NODE_ENV = 'production'

export { run, setExit, reset, mocha } from 'tman'
export * from './utils/fetch'
export * from './utils/utils'
export * from './utils/httpErrorSpec'

export * from './mock/MockSpec'

import './apis'
import './sockets'
