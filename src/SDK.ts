import { Observable } from 'rxjs/Observable'
import { Database } from 'reactivedb'
import { Net } from './Net'
import { forEach } from './utils'
import { SDKFetch } from './SDKFetch'
import { SocketClient } from './sockets/SocketClient'
import { mapWSMsgTypeToTable } from './sockets/MapToTable'
import { schemaColl } from './schemas'

export { schemaColl }
export { CacheStrategy } from './Net'

export class SDK {
  private schemas = schemaColl.toArray()

  net = new Net(this.schemas)
  fetch = new SDKFetch

  socketClient: SocketClient = new SocketClient(
    this.fetch,
    this.net,
    mapWSMsgTypeToTable
  )
  database: Database

  lift: typeof Net.prototype.lift = (ApiResult: any): any => {
    return this.net.lift(ApiResult)
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
