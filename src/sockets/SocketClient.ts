/**
 * bundle socket 的时候，这个文件是 tsc 的一个 entry
 * import 一下需要的 Rx 操作符
 */
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/take'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Net } from '../Net'
import { Database } from 'reactivedb'
import { SDKFetch } from '../SDKFetch'
import { socketHandler } from './EventMaps'
import * as Consumer from 'snapper-consumer'
import { UserMe } from '../schemas/UserMe'
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

export interface SocketClientOptions {
  url: string,
  path: string,
  isLegacyMode?: boolean,
  env?: string
}

export interface SocketConnectOptions {
  path?: string,
  onOpen?: (consumerId: string) => void,
  [snapperConnOptionKey: string]: any
}

export class SocketClient {
  private isLegacyMode = false
  private _isDebug = false

  private _client: Consumer
  private _socketUrl: string
  private connOptions: {}
  private _consumerId: string
  private _getUserMeStream = new ReplaySubject<UserMe>(1)
  private userField: tk.TokenField
  private onOpenCallback?: (consumerId: string) => void

  private _joinedRoom = new Set<string>()
  private _leavedRoom = new Set<string>()

  private clients = new Set<any>()

  private _tabNameToPKName: { [key: string]: string } = {}
  private database: Database

  private debugMsg = (msg: string): void => {
    if (this._isDebug) {
      ctx['console']['log'](msg)
    }
  }

  constructor(
    private fetch: SDKFetch,
    private net: Net,
    schemas?: SchemaColl,
    options: SocketClientOptions = { url: 'wss://push.teambition.com', path: '/websocket' }
  ) {
    this._isDebug = options.env === 'development'
    this.isLegacyMode = !!options.isLegacyMode
    this.userField = tk.userField(this.isLegacyMode)
    this._socketUrl = options.url
    this.connOptions = { path: options.path }
    this._tabNameToPKName = collectPKNames(schemas)
  }

  destroy() {
    this._getUserMeStream.complete()
  }

  debug(): void {
    this._isDebug = true
    this.debugMsg('socket debug start')
  }

  setConnectParams = (url: string, options?: SocketConnectOptions) => {
    this._socketUrl = url
    this.connOptions = { ...this.connOptions, ...options }
  }

  async initClient(client: Consumer, userMe?: UserMe) {
    if (!userMe) {
      await this._getToken()
    } else {
      this._getUserMeStream.next(userMe)
    }

    this._client = client
    this._client._join = this._join
    this._client.onmessage = this._onmessage
    this._client.onopen = this._onopen
    this._getUserMeStream.subscribe(u => {
      this._client.getToken = () => {
        return u[this.userField] as string
      }
    })
  }

  initReactiveDB(database: Database) {
    this.database = database

    const { _client, _onmessage } = this
    if (_client) {
      _client.onmessage = _onmessage
    }
  }

  public addClient = (client: any) => {
    this.clients.add(client)
  }

  async connect(host?: string, connOptions: SocketConnectOptions = {}) {
    if (!this._client) {
      return
    }

    const userMe = await this._getUserMeStream.take(1).toPromise()
    let token = userMe[this.userField] as string

    if (!tk.isValid(token as string)) {
      await this._getToken()
    }

    const me: UserMe = await this._getUserMeStream.take(1).toPromise()
    token = me[this.userField] as string

    this.onOpenCallback = connOptions.onOpen
    delete connOptions.onOpen

    const dest = host || this._socketUrl
    this._client.connect(dest, { token, ...this.connOptions, ...connOptions })
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
      await socketHandler(this.net, event, this._tabNameToPKName, this.database).toPromise()
    } catch (err) {
      ctx['console']['error'](err)
    }
  }

  private _getToken = async () => {
    const me: UserMe = await this.fetch.getUserMe().send().toPromise()
    this._getUserMeStream.next(me)
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
