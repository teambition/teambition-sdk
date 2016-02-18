'use strict'
import {Zone} from 'zone.js'
import {rootZone} from './bootstrap'
import {ETConstructor} from './component'
import {forEach} from './tbsdk'

export class ComponmentLeaf {

  public static parent: ComponmentLeaf

  public ViewName: string
  public $$children: Array<typeof ComponmentLeaf>

  private $$zone: Zone
  private Template: typeof ETConstructor
  private $$template: ETConstructor
  private $$shouldUpdateComponment = false
  private selector: string

  constructor(
    private original,
    private context,
    decorator: {
      selector: string,
      childNodes: any[],
      template: typeof ETConstructor
    }
  ) {
    this.ViewName = original.name
    this.$$zone = this.createZone(original.parent ? original.parent.$$zone : null)
    this.$$children = decorator.childNodes
    this.selector = decorator.selector
    this.Template = decorator.template
    this.mountChildNode()
    this.initZone()
  }

  public render (): Promise<any> {
    let initValue: Promise<any>
    this.$$zone.run(() => {
      initValue = this._onInit(this.context)
    })
    return initValue.then(() => {
      const Template = this.Template
      const template = new Template(this.context)
      const dom = template.get()
      const container = document.querySelector(this.selector)
      if (!container) throw new Error(`Can not find selector in ${this.ViewName}`)
      container.appendChild(dom)
      this.$$template = template
      this.context.$$template = template
      template.update()
    })
  }

  private _onInit (context) {
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
    console.log(this.ViewName, 'run', Date.now())
    return bindPromise()
  }

  private createZone (parentZone: Zone) {
    parentZone = parentZone || rootZone
    return parentZone.fork({
      'afterTask': () => {
        const template: ETConstructor = this.$$template
        if (!template || !this.$$shouldUpdateComponment) return
        template.update()
        console.log(`${this.ViewName} after task`)
      }
    })
  }

  private initZone () {
    const context = this.context
    if (!this.$$zone) return
    const keys = Object.keys(Object.getPrototypeOf(context))
    forEach(keys, (val: string) => {
      if (typeof context[val] === 'function') {
        const originFn = context[val]
        const fakeFn = (...args: any[]) => {
          let val
          this.$$zone.run(() => {
            val = originFn.apply(context, args)
            if (val && val instanceof Promise) {
              this.$$shouldUpdateComponment = false
              val.then(() => {
                this.$$shouldUpdateComponment = true
              })
            }
          })
          return val
        }
        context[val] = fakeFn
      }
    })
  }

  private mountChildNode () {
    const children = this.$$children
    if (!(children instanceof Array)) return
    forEach(children, (child) => {
      child.parent = this
    })
  }
}
