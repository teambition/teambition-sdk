'use strict'
import {Zone} from 'zone.js'
import {buildInjectable} from './injectable'
import {rootZone} from './bootstrap'
import {forEach} from './tbsdk'

export declare class ETConstructor {
  constructor(context: any)
  update(): void
  get(): DocumentFragment
  remove(): void
  destroy(): void
}

const componmentMap = new Map<string, any>()
const componmentFactoryMap = new Map<string, any>()

export function getComponment(name: string) {
  const componment = componmentMap.get(name)
  if (componment) return componment
  const factory = componmentFactoryMap.get(name)
  if (factory) return new factory()
  return false
}

export function setComponment(name: string, comp: any) {
  const cache = componmentMap.get(name)
  if (cache) return false
  componmentMap.set(name, comp)
}


const initZone = function (context) {
  if (!context.$$zone) return
  const keys = Object.keys(Object.getPrototypeOf(context))
  forEach(keys, (val: string) => {
    if (typeof context[val] === 'function') {
      const originFn = context[val]
      const fakeFn = (...args: any[]) => {
        let val
        context.$$zone.run(() => {
          val = originFn.apply(context, args)
          if (val && val instanceof Promise) {
            context.$$shouldUpdateComponment = false
            val.then(() => {
              context.$$shouldUpdateComponment = true
            })
          }
        })
        return val
      }
      context[val] = fakeFn
    }
  })
}

const _onInit = (context) => {
  let bindPromise: () => Promise<any>
  if (typeof context.onInit !== 'function') {
    context.$$shouldUpdateComponment = true
    return Promise.resolve()
  }
  bindPromise = Zone.bindPromiseFn(() => {
    const initValue = context.onInit()
    if (!(initValue instanceof Promise)) return Promise.resolve(initValue)
    return initValue.then(() => {
      context.$$shouldUpdateComponment = true
      if (typeof context.onAllChangesDone !== 'function') {
        return
      }
      return context.onAllChangesDone()
    })
    .catch((err) => {
      console.error(err)
    })
  })
  console.log(context.ViewName, 'run', Date.now())
  return bindPromise()
}

const createZone = (parentZone: Zone, context: any) => {
  parentZone = parentZone || rootZone
  return parentZone.fork({
    'afterTask': () => {
      const template: ETConstructor = context.$$template
      if (!template || !context.$$shouldUpdateComponment) return
      template.update()
      console.log(`${context.ViewName} after task`)
    }
  })
}

const mountChildNode = (context, children: any[]) => {
  if (!(children instanceof Array)) return
  forEach(children, (child) => {
    child.parent = context
  })
}

export function componments(options: {
  template: typeof ETConstructor,
  selector: string,
  injectable?: any[],
  childNodes?: any[]
}) {
  return (target: any) => {
    const original = target
    const viewName: string = original.name
    let context: any

    const Template = options.template

    function construct(constructor: any, args: any[]) {
      const Componment: any = function() {
        const _arguments = buildInjectable(this, args)
        return constructor.apply(this, _arguments)
      }
      Componment.prototype = constructor.prototype
      return new Componment()
    }

    var f : any = function () {
      context = construct(original, options.injectable)
      context.ViewName = viewName
      context.$$zone = createZone(context.parent ? context.parent.zone : null, context)
      context.$$render = function (): Promise<any> {
        let initValue: Promise<any>
        context.$$zone.run(() => {
          initValue = _onInit(context)
        })
        return initValue.then(() => {
          const template = new Template(context)
          const dom = template.get()
          const container = document.querySelector(options.selector)
          if (!container) throw new Error(`Can not find selector in ${original.name}`)
          container.appendChild(dom)
          context.$$template = template
          template.update()
        })
      }
      context.$$shouldUpdateComponment = false
      context.$$children = options.childNodes
      mountChildNode(context, options.childNodes)
      initZone(context)
      componmentMap.set(viewName, context)
      return context
    }

    f.prototype = original.prototype

    componmentFactoryMap.set(viewName, f)
  }
}
