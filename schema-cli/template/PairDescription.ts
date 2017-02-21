import { IDescription } from '../interface/IDescription'

export class PairDescription implements IDescription {

  constructor(
    private keyName: string,
    private type: string,
    private isPk: boolean = false
  ) { }

  stringify(indent: number = 0) {
    const ws = Array.from({ length: indent }).fill(' ').join('')

    const ret = [
      this.keyName + ': {',
      ws + 'type: ' + this.type,
      '}'
    ]

    if (this.isPk) {
      ret[1] += ','
      ret.splice(2, 0, ws + 'primaryKey : true')
    }

    return ret.map(str => ws + str).join('\r\n')
  }

}
