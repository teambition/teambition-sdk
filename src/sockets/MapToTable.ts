import Dirty from '../utils/Dirty'
import { Dict, SchemaColl, TableInfo } from '../utils/internalTypes'
import { SDKLogger } from '../utils/Logger'

const byLowerCase = (ret: Dict<string>, x: string) => {
  ret[x.toLowerCase()] = x
  return ret
}

const collectPKNames = (schemas: SchemaColl) =>
  schemas.reduce((ret, { schema, name }) => {
    ret[name] = Dirty.getPKNameinSchema(schema)
    return ret
  }, {} as Dict<string>)

const cutTrailingS = (msgType: string): string =>
  msgType.slice(-1) === 's' ? msgType.slice(0, -1) : msgType

export class TableInfoByMessageType {

  private tabNameByLowerCase: Dict<string>
  private tabAliasByLowerCase: Dict<string>
  private pkNameByTabName: Dict<string>

  constructor(schemas: SchemaColl, private tableAlias: Dict<string>) {
    this.pkNameByTabName = collectPKNames(schemas)

    const tabNames = Object.keys(this.pkNameByTabName)
    const aliases = Object.keys(this.tableAlias)

    this.tabNameByLowerCase = tabNames.reduce(byLowerCase, {})
    this.tabAliasByLowerCase = aliases.reduce(byLowerCase, {})
  }

  private getTableName(msgType: string): string | undefined {
    const msgtypes = msgType.toLowerCase()

    const alias = this.tabAliasByLowerCase[msgtypes]
    if (alias) {
      return this.tableAlias[alias]
    }

    const msgtype = cutTrailingS(msgtypes)
    return this.tabNameByLowerCase[msgtype]
  }

  getTableInfo(msgType: string): TableInfo | null {
    const tabName = this.getTableName(msgType)

    if (!tabName) {
      SDKLogger.warn(`Table not found for message of type ${msgType}`)
      return null
    }

    return {
      tabName,
      pkName: this.pkNameByTabName[tabName]
    }
  }
}
