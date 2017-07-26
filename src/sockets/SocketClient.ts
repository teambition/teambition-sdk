/**
 * bundle socket 的时候，这个文件是 tsc 的一个 entry
 * import 一下需要的 Rx 操作符
 */
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/take'
import { Net } from '../Net'
import { Database } from 'reactivedb'
import { SDKFetch } from '../SDKFetch'
import { socketHandler } from './EventMaps'
import * as Consumer from 'snapper-consumer'
import Dirty from '../utils/Dirty'
import { SchemaColl } from '../utils/internalTypes'
import * as tk from './token'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

function collectPKNames(schemas: SchemaColl = []) {
  return schemas.reduce((dict, { schema, name }) => {
    dict[name] = Dirty.getPKNameinSchema(schema)
    return dict
  }, {})
}

export type SocketClientOptions = {
  env?: string,
  isLegacyMode?: boolean,
}

export type SocketConnectOptions = {
  host: string,
  path: string,
  token?: string,
  onOpen?: (consumerId: string) => void,
  [snapperConnOptionKey: string]: any
}

export class SocketClient {
  private isLegacyMode = false
  private isDebug = false

  private _client: Consumer
  private _consumerId: string
  private connOptions: SocketConnectOptions
  private token: tk.ValidToken
  private onOpenCallback?: (consumerId: string) => void

  private _joinedRoom = new Set<string>()
  private _leavedRoom = new Set<string>()

  private clients = new Set<any>()

  private tabNameToPKName: { [key: string]: string } = {}
  private database: Database

  private debugMsg = (msg: string): void => {
    if (this.isDebug) {
      ctx['console']['log'](msg)
    }
  }

  constructor(
    private fetch: SDKFetch,
    private net: Net,
    schemas?: SchemaColl,
    options: SocketClientOptions = {}
  ) {
    this.tabNameToPKName = collectPKNames(schemas)
    this.isLegacyMode = !!options.isLegacyMode
    this.isDebug = options.env === 'development'
  }

  debug(): void {
    this.isDebug = true
    this.debugMsg('socket debug start')
  }

  initClient(client: Consumer) {
    this._client = client
    this._client._join = this._join
    this._client.onmessage = this._onmessage
    this._client.onopen = this._onopen
  }

  addClient = (client: any) => {
    this.clients.add(client)
  }

  initReactiveDB(database: Database) {
    this.database = database

    if (this._client) {
      this._client.onmessage = this._onmessage
    }
  }

  reset() {
    if (this._client) {
      this._client.close()
    }
    this.token.destroy()
  }

  setConnectOptions = (options: SocketConnectOptions) => {
    this.connOptions = { ...this.connOptions, ...options }
  }

  async connect(host?: string, connOptions: Partial<SocketConnectOptions> = {}) {
    if (!this._client) {
      console.error('push service client is not ready')
      return
    }

    if (connOptions.onOpen) {
      this.onOpenCallback = connOptions.onOpen
      delete connOptions.onOpen
    }

    const dest = host || connOptions.host!

    try {
      this.token = await tk.setUpValidTokenStream(
        this.fetch,
        this._client,
        this.isLegacyMode,
        2000
      )
    } catch (e) {
      console.error(`failed to set up valid token stream; legacy mode: ${this.isLegacyMode}`, e)
      return
    }

    this._client.connect(dest, {
      token: this.token.get(),
      ...this.connOptions,
      ...connOptions
    })
  }

  /**
   * uri 格式: :type/:id
   * eg: projects, organizations/554c83b1b2c809b4715d17b0
   */
  join(uri: string): Consumer | undefined {
    const { _client, _joinedRoom } = this
    if (!_client) {
      return
    }
    if (_joinedRoom.has(uri)) {
      return _client
    }
    return _client.join.call(_client, uri)
  }

  async leave(uri: string, consumerId?: string) {
    const _consumerId = consumerId || this._consumerId

    if (!_consumerId) {
      return Promise.reject(new Error(`leave room failed, no consumerId`))
    }
    if (this._leavedRoom.has(uri)) {
      return Promise.resolve()
    }
    try {
      await this.fetch.leaveRoom(uri, _consumerId)
      this._joinedRoom.delete(uri)
      this._leavedRoom.add(uri)
    } catch (e) {
      console.error(e)
    }
  }

  // override Consumer onopen
  private _onopen = (): void => {
    const consumerId = this._client['consumerId']
    if (this.onOpenCallback) {
      this.onOpenCallback(consumerId)
    }

    this._joinedRoom.forEach(this.join.bind(this))

    this.debugMsg('--- WebSocket Opened ---')
  }

  private _onmessage = async (event: Consumer.RequestEvent) => {
    // 避免被插件清除掉
    this.debugMsg(JSON.stringify(event, null, 2))
    this.clients.forEach((client: any) => {
      client._onmessage(event)
    })
    try {
      await socketHandler(this.net, event, this.tabNameToPKName, this.database).toPromise()
    } catch (err) {
      ctx['console']['error'](err)
    }
  }

  private _join = async (room: string, consumerId: string) => {
    this._consumerId = consumerId
    try {
      await this.fetch.joinRoom(room, consumerId)
      this._joinedRoom.add(room)
    } catch (e) {
      console.error(e)
    }
  }

}

export function leaveRoom(
  this: SDKFetch,
  room: string,
  consumerId: string
) {
  return (<any>this.delete)(`${room}/subscribe`, {
    consumerId
  })
    .send()
    .toPromise()
}

export function joinRoom(
  this: SDKFetch,
  room: string,
  consumerId: string
) {
  return this.post<void>(`${room}/subscribe`, {
    consumerId: consumerId
  })
    .send()
    .toPromise()
}

SDKFetch.prototype.leaveRoom = leaveRoom
SDKFetch.prototype.joinRoom = joinRoom

declare module '../SDKFetch' {
  interface SDKFetch {
    joinRoom: typeof joinRoom
    leaveRoom: typeof leaveRoom
  }
}
