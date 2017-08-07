'use strict'
import 'isomorphic-fetch'

process.env.NODE_ENV = 'production'

export { run, setExit, reset, mocha } from 'tman'

import './apis'

import './asyncLoadRDB.spec'

import '../src/index'
