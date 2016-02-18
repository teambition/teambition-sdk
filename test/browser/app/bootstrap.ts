'use strict'
import {Zone} from 'zone.js'
import {getComponment, setComponment} from './component'
import {ComponmentsTree} from './components_tree'


export const rootZone = new Zone()

export function bootstrap (Comp): Promise<any> {
  const componment = getComponment(Comp.name)
  setComponment('$$root', componment)
  const tree = new ComponmentsTree(componment)
  return tree.renderLeafs()
}
