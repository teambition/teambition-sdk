'use strict'
import * as path from 'path'

const Tsd = require('tsd')
const GetAPI  = Tsd.getAPI
const tsdJson = path.join(process.cwd(), 'tsd.json')
const tsdApi  = new GetAPI(tsdJson)

const install = async function () {
  let packageJson = require(path.join(process.cwd(), 'package.json'))
  // removed tsd from dependencies
  delete packageJson.devDependencies.tsd
  delete packageJson.dependencies['whatwg-fetch']
  delete packageJson.dependencies['es6-promise']
  let deps = Object.keys(packageJson.dependencies)
  let devDeps = Object.keys(packageJson.devDependencies)
  let query = new Tsd.Query()
  deps.concat(devDeps).forEach(dependency => query.addNamePattern(dependency))
  let options = new Tsd.Options()
  options.resolveDependencies = true
  options.overwriteFiles = true
  options.saveBundle = true

  await tsdApi.readConfig()

  let selection = await tsdApi.select(query, options)
  let installResult = await tsdApi.install(selection, options)
  let written = Object.keys(installResult.written.dict)
  let removed = Object.keys(installResult.removed.dict)
  let skipped = Object.keys(installResult.skipped.dict)
  written.forEach(function (dts) {
    console.log('Definition file written: ' + dts)
  })

  removed.forEach(function (dts) {
    console.log('Definition file removed: ' + dts)
  })

  skipped.forEach(function (dts) {
    console.log('Definition file skipped: ' + dts)
  })
}

install()
