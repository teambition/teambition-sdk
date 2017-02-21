import * as fs from 'fs'
import * as path from 'path'

import { prompt } from '../prompt'
import { AssocationDescription, PairDescription } from '../template'
import { IDescription } from '../interface/IDescription'

export const currentDir = process.cwd()
export const emptyLine = ''

export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/\s+/g, '')
}

export const capitalize = function(content: string) {
  return content.charAt(0).toUpperCase() + content.slice(1)
}

export function genRdbType(data) {
  const reISO8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i

  if (typeof data === 'number') {
    return `RDBType.NUMBER`
  } else if (typeof data === 'boolean') {
    return `RDBType.BOOLEAN`
  } else if (typeof data === 'string') {
    if (reISO8601.test(data)) {
      return `RDBType.DATE_TIME`
    }
    return `RDBType.STRING`
  } else if (typeof data === 'object') {
    if (data === null || data === undefined) {
      return `RDBType.UNKNOWN`
    } else if (Array.isArray(data)) {
      if (data.every(item => typeof item === 'string')) {
        return `RDBType.LITERAL_ARRAY`
      }
      return `RDBType.UNKNOWN`
    }

    return `RDBType.OBJECT`
  }
}

export const createPairsDescription = function(payload: Object, containList: string[] = []) {
  const desc = new Map<string, IDescription>()
  const reId = /\w*Id$/

  for (const key of Object.keys(payload)) {
    if (!key || containList.find(field => field === key) === undefined) {
      continue
    }

    const value = payload[key]
    if (key === '_id') {
      desc.set(key, new PairDescription(key, 'RDBType.STRING', true))
      continue
    }

    if (reId.test(key)) {
      desc.set(key, new PairDescription(key, 'RDBType.STRING'))
      continue
    }

    desc.set(key, new PairDescription(key, genRdbType(value)))
  }

  return desc
}

export const attachAssocDescription = function(map: Map<string, IDescription>, association: any[]) {
  if (association.length) {
    for (const relationship of association) {
      const { type, info } = relationship
      const [ navigator, targetTable, targetField, associateField ] = info

      const assocDesc = new AssocationDescription(navigator, targetTable, targetField, type, associateField)
      map.set(associateField, assocDesc)
    }
  }
}

export function suffixOf(i) {
    const j = i % 10
    const k = i % 100

    if (j == 1 && k != 11) {
        return i + 'st'
    }
    if (j == 2 && k != 12) {
        return i + 'nd'
    }
    if (j == 3 && k != 13) {
        return i + 'rd'
    }
    return i + 'th'
}

export const ensureDir = function(directory) {
  const scopedPath = [currentDir, directory].join(path.sep)
  return new Promise((resolve) => {
    fs.stat(scopedPath, (err) => {
      if (err) {
        fs.mkdir(scopedPath, () => {
          resolve(scopedPath)
        })
      } else {
        resolve(scopedPath)
      }
    })
  })
}

export const isExist = async function(path: string) {
  return new Promise((resolve) => {
    fs.exists(path, (status: boolean) => {
      resolve(status)
    })
  })
}

export const deleteFile = async function(path: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(false)
      }
    })
  })
}

export const read = async function(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export const output: (filename: string, data: string) => Promise<string> = async function(filename: string, data: string) {
  const dir = await ensureDir('output')
  const name = [dir, filename].join(path.sep)

  let isFileExist = await isExist(name)
  if (isFileExist) {
    const { shouldDelete } = await prompt([{
      name: 'shouldDelete',
      type: 'confirm',
      message: `File: ${name} is already existed, do you want to delete it?`,
      default: false
    }])

    if (shouldDelete) {
      isFileExist = await deleteFile(name)
    }
  }

  return new Promise((resolve, reject) => {
    if (isFileExist) {
      reject(new Error(`File: ${name} is already existed.`))
    }

    fs.writeFile(name, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(name)
      }
    })
  })
}

export const tryParseFixture = (content) => {
  const ret = JSON.parse(content)
  if (Array.isArray(ret)) {
    return ret[0]
  }
  return ret
}
