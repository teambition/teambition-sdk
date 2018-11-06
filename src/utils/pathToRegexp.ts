const DELIMITER = '/'
const DELIMITERS = './'

export interface Option {
  delimiter?: string
  delimiters?: string
  prefix: boolean
  fromStart: boolean
}

type EventToken = string | {
  name: string | number,
  prefix: string,
  delimiter: string,
  optional: boolean,
  repeat: boolean,
  partial: boolean,
  pattern: string
}

// see https://jex.im/regulex
const prefixRE = /^(\:\w+\:)(.*)/
const pathRE = /(\\.)|(?:\:(\w+)(?:\(((?:\\.|[^\\()])+)\))?|\(((?:\\.|[^\\()])+)\))([+*?])?/g

const escape = {
  string: (s: string) => s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1'),
  group: (s: string) => s.replace(/([=!:$/()])/g, '\\$1')
}

const tokenizer = (str: string, option: Option) => {

  const tokens: EventToken[] = []
  const defaultDelimiter = (option && option.delimiter) || DELIMITER
  const delimiters = (option && option.delimiters) || DELIMITERS

  let prefix: string = ''
  let prefixRes: RegExpExecArray | null

  if (option.prefix === true) {
    while ((prefixRes = prefixRE.exec(str)) !== null) {
      if (prefix !== '') {
        throw new Error('Invalid socket event')
      }
      prefix = prefixRes[1]
      str = str.slice(prefix.length)
    }

    if (prefix === '') {
      throw new Error('Invalid socket event')
    }

    tokens.push(prefix)
  }

  let key = 0
  let index = 0
  let path = ''
  let pathEscaped = false
  let res: RegExpExecArray | null

  while ((res = pathRE.exec(str)) !== null) {
    const [ m, escaped ] = res
    const offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    if (escaped) {
      path += escaped[1]
      pathEscaped = true
      continue
    }

    let prev = ''
    const next = str[index]
    const [ , , name, capture, group, modifier ] = res

    if (!pathEscaped && path.length) {
      const k = path.length - 1

      if (delimiters.indexOf(path[k]) > -1) {
        prev = path[k]
        path = path.slice(0, k)
      }
    }

    if (path) {
      tokens.push(path)
      path = ''
      pathEscaped = false
    }

    const partial = prev !== '' && next !== undefined && next !== prev
    const repeat = modifier === '+' || modifier === '*'
    const optional = modifier === '?' || modifier === '*'
    const delimiter = prev || defaultDelimiter
    const pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prev,
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      pattern: pattern ? escape.group(pattern) : '[^' + escape.string(delimiter) + ']+?'
    })
  }

  if (path || index < str.length) {
    tokens.push(path + str.substr(index))
  }

  return tokens
}

const tokenToRegexp = (tokens: EventToken[], option: Option) => {
  const delimiter = escape.string(option.delimiter || DELIMITER)

  let ret = ''

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (typeof token === 'string') {
      ret += escape.string(token)
    } else {
      const p = escape.string(token.prefix)
      const capture = token.repeat
        ? `(?:${token.pattern})(?:${p}(?:${token.pattern}))*`
        : token.pattern

      if (token.optional && !token.partial) {
        ret += `(?:${p}(${capture}))`
      } else {
        ret += `${p}(${capture})`
      }
    }
  }

  ret += `(?:${delimiter})?`
  const re = option.fromStart ? '^' + ret : ret
  return new RegExp(re, 'ig')
}

export const pathToRegexp = (str: string, option: Option = { prefix: true, fromStart: true }) => {
  const tokens = tokenizer(str, option)
  const re = tokenToRegexp(tokens, option)
  return re
}
