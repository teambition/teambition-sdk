/**
 * The following functions serve to polyfill window.Headers for
 * browsers on which window.Headers is not supported, e.g. IE 11.
 *
 * The code is copied from whatwg-fetch@2.0.4, and tranformed
 * to Typescript, by @chuan6.
 *
 * Please refer to https://github.com/github/fetch for more.
 */

const support = {
  iterable: 'Symbol' in self && 'iterator' in Symbol
}

function normalizeName(name: any) {
  if (typeof name !== 'string') {
    name = String(name)
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
    throw new TypeError('Invalid character in header field name')
  }
  return name.toLowerCase()
}

function normalizeValue(value: any) {
  if (typeof value !== 'string') {
    value = String(value)
  }
  return value
}

// _Build a destructive iterator for the value list
function iteratorFor(items: any[]) {
  const iterator = {
    next: function() {
      const value = items.shift()
      return { done: value === undefined, value: value }
    }
  }

  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator
    }
  }

  return iterator
}

export class HeadersPolyfill {

  private map: any = {}

  constructor(headers: any) {
    if (headers instanceof HeadersPolyfill) {
      headers.forEach(function(this: any, value: any, name: any) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(this: any, header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(this: any, name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  append(name: any, value: any) {
    name = normalizeName(name)
    value = normalizeValue(value)
    const oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue + ', ' + value : value
  }

  delete(name: any) {
    delete this.map[normalizeName(name)]
  }

  get(name: any) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  has(name: any) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  set(name: any, value: any) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  forEach(callback: Function, thisArg?: any) {
    for (const name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  keys() {
    const items: any[] = []
    this.forEach((_value: any, name: any) => {
      items.push(name)
    })
    return iteratorFor(items)
  }

  values() {
    const items: any[] = []
    this.forEach((value: any) => {
      items.push(value)
    })
    return iteratorFor(items)
  }

  entries() {
    const items: any[] = []
    this.forEach((value: any, name: any) => {
      items.push([name, value])
    })
    return iteratorFor(items)
  }

  [Symbol.iterator] = this.entries

}

if (!self['Headers']) {
  self['Headers'] = HeadersPolyfill
}
