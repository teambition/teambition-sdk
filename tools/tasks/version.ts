'use strict'

const version = require('../../package.json').version
const { execSync, exec } = require('child_process')
const semver = require('semver')
const scriptType = process.argv[2]

function dropQuotes(s: string) {
  const chars = Array.from(s)
  const charsRemain = chars.reduce((ret: { type?: string, value: string[] }, x: string) => {
    if (x === '\"' && !ret.type) {
      return { ...ret, type: 'open' }
    }
    if (x === '\"' && ret.type === 'open') {
      return { ...ret, type: 'close' }
    }
    if (ret.type === 'open') {
      ret.value.push(x)
    }
    return ret
  }, { value: [] }).value
  return charsRemain.join('')
}

function preversion() {
  console.info('local version:\t', version)
  console.info('local branch:\t', execSync('git rev-parse --abbrev-ref HEAD').toString().split('\n')[0])
  console.info('...fetching latest release info...')
  exec('npm view --json teambition-sdk versions', (error: any, stdout: any, _stderr: any) => {
    if (error) {
      console.error('Failed to fetch latest release info.')
      return
    }
    const old2latest = stdout.split('\n').map(dropQuotes).filter(Boolean)
    let latestPrerelease = null
    let latestRelease = null

    for (let i = old2latest.length - 1; i >= 0; i--) {
      const r = old2latest[i]
      if (semver.prerelease(r)) {
        latestPrerelease = latestPrerelease || r
      } else {
        latestRelease = latestRelease || r
      }
      if (latestPrerelease && latestRelease) {
        break
      }
    }
    console.info('release:\t', latestRelease)
    console.info('prerelease:\t', latestPrerelease)
  })
}

switch (scriptType) {
  case 'preversion':
    preversion()
    break
  default:
    break
}
