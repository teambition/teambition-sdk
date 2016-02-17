'use strict'
import {forEach} from './tbsdk'

const injectorMap = new Map<string, any>()

export function buildInjectable(context, injects: any[]) {
  if (!(injects instanceof Array)) return
  const results = []
  forEach(injects, (Factory) => {
    const factoryName = Factory.name
    let result = injectorMap.get(factoryName)
    if (!result) {
      result = new Factory()
      injectorMap.set(factoryName, result)
    }
    results.push(result)
    bindContext(context, result)
  })
  return results
}

function bindContext(context, instance) {
  const keys = Object.keys(Object.getPrototypeOf(instance))
  forEach(keys, (propertyName) => {
    const property = instance[propertyName]
    if (typeof property !== 'function') return
    instance[propertyName] = function () {
      const result = property.apply(instance, arguments)
      if (result && result instanceof Promise) {
        result.then((res) => {
          if (typeof res.$digest !== 'function') return
          res.$digest = function () {
            if (!context || !context.$$template) return
            context.$$template.update()
          }
        })
      }
      return result
    }
  })
}
