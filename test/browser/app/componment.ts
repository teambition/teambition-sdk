'use strict'
import {Zone} from 'zone.js'
import {rootZone} from './bootstrap'
import {forEach} from './index'

export declare class ETConstructor {
  constructor(context: any)
  update(): void
  get(): DocumentFragment
  remove(): void
  destroy(): void
}

const zoneMap = new Map<string, Zone>()

const notPatched = ['constructor', 'zone']

// const initZone = function (context) {
//   if (!context.zone) return
//   const keys = Object.keys(context)
//   forEach(keys, (val: string) => {
//     if (typeof context[val] === 'function' && notPatched.indexOf(val) === -1) {
//       const originFn = context[val]
//       const fakeFn = (...args: any[]) => {
//         let val
//         context.zone.run(() => {
//           val = originFn.apply(context, args)
//         })
//         return val
//       }
//       context[val] = fakeFn
//     }
//   })
//   if (context.template) return context.template.update()
// }

const _onInit = (context) => {
  let bindPromise: () => Promise<any>
  if (typeof context.onInit !== 'function') return Promise.resolve(context.render())
  bindPromise = Zone.bindPromiseFn(() => {
    return context.onInit()
    .then(() => {
      context.render()
      if (typeof context.onAllChangesDone !== 'function') return
      return context.onAllChangesDone()
    })
    .catch((err) => {
      console.error(err)
    })
  })
  console.log(context.ViewName, 'run', Date.now())
  return bindPromise()
}

export function componments(options: {
  template: typeof ETConstructor,
  selector: string,
  injectable?: any[],
  parentName?: string
}) {
  return (target: any) => {
    const original = target
    let context: any

    const Template = options.template
    const parentZone = zoneMap.get(options.parentName) || rootZone
    const currentZone = parentZone.fork({
      'afterTask': () => {
        console.log(`${original.name} after task`)
        const template: ETConstructor = context.template
        if (!template) return
        template.update()
      }
    })

    function construct(constructor: any, args: any[]) {
      let p
      const Componment: any = function() {
        p = constructor.apply(this, args)
        return p
      }
      Componment.prototype = constructor.prototype
      return new Componment()
    }

    var f : any = function () {
      context = construct(original, options.injectable)
      context.ViewName = original.name
      context.zone = currentZone
      context.render = function () {
        const template = new Template(context)
        const dom = template.get()
        const container = document.querySelector(options.selector)
        if (!container) throw new Error(`Can not find selector in ${original.name}`)
        container.appendChild(dom)
        context.template = template
      }
      context.zone.run(() => {
        _onInit(context)
      })
      // initZone(context)
      return context
    }

    f.prototype = original.prototype

    return new f()
  }
}
