import { IDescription } from '../interface/IDescription'

export class AssocationDescription implements IDescription {

  constructor(
    private navigator: string,
    private targetTable: string,
    private targetField: string,
    private assocType: string,
    private associateField: string
  ) {}

  stringify(indent: number = 0) {
    const ws = Array.from({ length: indent }).fill(' ').join('')

    const ret = [
      this.associateField + ': {',
      ws + 'type: ' + `Association.${this.assocType},`,
      ws + 'virtual: {',
      ws + ws + 'name: ' + `'${this.targetTable}',`,
      ws + ws + 'where: ' + `(${this.targetTable}Table) => ({`,
      ws + ws + ws + `${this.navigator}: ` + `${this.targetTable}Table.${this.targetField}`,
      ws + ws + '})',
      ws + '}',
      '}'
    ]

    return ret.map(str => ws + str).join('\r\n')
  }

}
