import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import { Observable } from 'rxjs/Observable'
import {
  Database
} from 'reactivedb'
import { Net } from './Net'

import { forEach } from './utils'
import { SDKFetch } from './SDKFetch'
import { SocketClient } from './sockets/SocketClient'
import { SchemaColl } from './utils/internalTypes'

export enum CacheStrategy {
  Request = 200,
  Cache,
  Pass
}

export const schemas: SchemaColl = []

export class SDK {
  public net: Net
  fetch = new SDKFetch
  socketClient: SocketClient
  public database: Database

  constructor() {
    this.net = new Net(schemas)
    this.socketClient = new SocketClient(this.fetch, this.net, schemas)
  }

  initReactiveDB (db: Database): Observable<void[]> {
    this.database = db
    forEach(schemas, d => {
      this.database.defineSchema(d.name, d.schema)
    })
    this.database.connect()

    this.socketClient.initReactiveDB(this.database)
    return this.net.persist(this.database)
  }

  get lift(): typeof Net.prototype.lift {
    return this.net.lift.bind(this.net)
  }

}
