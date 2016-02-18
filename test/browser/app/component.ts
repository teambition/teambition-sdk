'use strict'
import {buildInjectable} from './injectable'
import {ComponmentLeaf} from './component_leaf'

export declare class ETConstructor {
  constructor(context: any)
  update(): void
  get(): DocumentFragment
  remove(): void
  destroy(): void
}

const componmentMap = new Map<string, any>()
const componmentFactoryMap = new Map<string, any>()

export function getComponment(name: string): ComponmentLeaf {
  const componment = componmentMap.get(name)
  if (componment) return componment
  const factory = componmentFactoryMap.get(name)
  if (factory) return new factory()
  return
}

export function setComponment(name: string, comp: any) {
  const cache = componmentMap.get(name)
  if (cache) return false
  componmentMap.set(name, comp)
}

export function componments(decorator: {
  template: typeof ETConstructor,
  selector: string,
  injectable?: any[],
  childNodes?: any[]
}) {
  return (target: any) => {
    const original = target
    const viewName: string = original.name
    let context: any

    function construct(constructor: any, args: any[]) {
      const Componment: any = function() {
        const _arguments = buildInjectable(this, args)
        return constructor.apply(this, _arguments)
      }
      Componment.prototype = constructor.prototype
      return new Componment()
    }

    var f : any = function () {
      context = construct(original, decorator.injectable)
      const leaf = new ComponmentLeaf(original, context, {
        selector: decorator.selector,
        childNodes: decorator.childNodes,
        template: decorator.template
      })
      componmentMap.set(viewName, leaf)
      return leaf
    }

    f.prototype = original.prototype

    componmentFactoryMap.set(viewName, f)
  }
}
