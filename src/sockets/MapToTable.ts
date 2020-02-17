import { Dict, TableInfo } from '../utils'
import { SDKLogger } from '../utils/Logger'
import { SchemaCollection, schemaColl as globalSchemaColl } from '../schemas'
import globalTableAlias from './TableAlias'

const byLowerCase = (ret: Dict<string>, x: string) => {
  ret[x.toLowerCase()] = x
  return ret
}

const cutTrailingS = (msgType: string): string =>
  msgType.slice(-1) === 's' ? msgType.slice(0, -1) : msgType

export class TableInfoByMessageType {

  private tabNameByLowerCase: Dict<string>
  private tabAliasByLowerCase: Dict<string>

  constructor(private schemaColl: SchemaCollection, private tableAlias: Dict<string>) {
    const tabNames = this.schemaColl.listTableNames()
    const aliases = Object.keys(this.tableAlias)

    this.tabNameByLowerCase = tabNames.reduce(byLowerCase, {})
    this.tabAliasByLowerCase = aliases.reduce(byLowerCase, {})
  }

  private getTableName(msgType: string): string | undefined {
    const msgtype = msgType.toLowerCase()

    const alias = this.tabAliasByLowerCase[msgtype]
    if (alias) {
      return this.tableAlias[alias]
    }

    return this.tabNameByLowerCase[msgtype]
     || this.tabNameByLowerCase[cutTrailingS(msgtype)]
  }

  getTableInfo(msgType: string): TableInfo | null {
    const tabName = this.getTableName(msgType)

    if (!tabName) {
      SDKLogger.warn(`Table not found for message of type ${msgType}`)
      return null
    }

    return {
      tabName,
      pkName: this.schemaColl.getSchemaPKName(tabName)
    }
  }
}

export const mapMsgTypeToTable = new TableInfoByMessageType(
  globalSchemaColl,
  globalTableAlias
)
