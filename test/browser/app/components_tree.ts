'use strict'
import {getComponment} from './component'
import {ComponmentLeaf} from './component_leaf'

export class ComponmentsTree {

  constructor(private root: ComponmentLeaf) {}

  renderLeafs() {
    const topLevelChild = this.root.$$children
    if (!topLevelChild.length) return
    return this.root.render().then(() => {
      return Promise.all(topLevelChild.map(leaf => this._renderLeafAndChildren(leaf)))
    })
  }

  private _renderLeafAndChildren(leaf) {
    const leafNode = getComponment(leaf.name)
    if (!leafNode) return
    const children = leafNode.$$children
    if (typeof leafNode.render !== 'function') return
    return leafNode.render().then(() => {
      if (!children || !children.length) return
      return Promise.all(children.map(childLeaf => this._renderLeafAndChildren(childLeaf)))
    })

  }
}
