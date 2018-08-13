'use strict'

const version = require('../../package.json').version
const { execSync } = require('child_process')
const semver = require('semver')
const distPath = process.argv[2]
const restArgs = process.argv.slice(3)
console.info(restArgs)

const npmPublishOptions = {}

export function options2line(options: {}) {
  return Object.keys(options).map((key) => {
    return `--${key} ${options[key]}`
  }).join(' ')
}

if (semver.prerelease(version)) {
  Object.assign(npmPublishOptions, { tag: 'prerelease' })
}

execSync(
  `npm publish ${distPath} ${options2line(npmPublishOptions)} ${restArgs.join(' ')}`,
  (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(stderr.toString())
      return
    }
    console.info(stdout.toString())
  }
)
