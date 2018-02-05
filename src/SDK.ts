import { Observable } from 'rxjs/Observable'
import { Database } from 'reactivedb'
import { Net } from './Net'
import { forEach } from './utils'
import { SDKFetch } from './SDKFetch'
import { SocketClient } from './sockets/SocketClient'
import { mapWSMsgTypeToTable } from './sockets/MapToTable'
import { schemaColl } from './schemas'
import { WSProxy } from './sockets/Middleware'
import { SchemaColl } from './utils/internalTypes'

export const schemas: SchemaColl = []

export { schemaColl }
export { CacheStrategy } from './Net'

export class SDK {
  private schemas = schemaColl.toArray()

  net = new Net(this.schemas)
  fetch = new SDKFetch

  socketClient: SocketClient
  database: Database
  wsProxy: WSProxy

  lift: typeof Net.prototype.lift = (ApiResult: any): any => {
    return this.net.lift(ApiResult)
  }

  constructor() {
    this.socketClient = new SocketClient(
      this.fetch,
      this.net,
      mapWSMsgTypeToTable
    )
    this.wsProxy = this.socketClient.proxy
  }

  initReactiveDB (db: Database): Observable<void[]> {
    this.database = db
    forEach(this.schemas, d => {
      this.database.defineSchema(d.name, d.schema)
    })
    this.database.connect()

    this.socketClient.initReactiveDB(this.database)

    return this.net.persist(this.database)
  }

}
