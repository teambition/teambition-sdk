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
import { socketHandler, createMsgToDBHandler, createMsgHandler } from './EventMaps'
import { Interceptors, Proxy } from './Middleware'
import * as Consumer from 'snapper-consumer'
import { UserMe } from '../schemas/UserMe'
import { TableInfoByMessageType } from './MapToTable'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

export class SocketClient {
  private _isDebug = false

  private _client: Consumer

  private _socketUrl = 'wss://push.teambition.com'

  private _consumerId: string

  private _getUserMeStream = new ReplaySubject<UserMe>(1)

  private _joinedRoom = new Set<string>()
  private _leavedRoom = new Set<string>()

  /**
   * 拦截器序列。如果需要在消息接触 db 之前对起进行额外的过滤、变换
   * 等操作，可以在这里添加相应 handler。
   */
  public interceptors: Interceptors = new Interceptors()
  /**
   * 代理。如果需要获得不会接触 db 的消息（与数据模型无关），比如界面
   * 状态变更的消息等，可以在这里注册相应 handler。
   */
  public proxy: Proxy = new Proxy()

  private handleMsgToDB = createMsgToDBHandler(this.interceptors)
  private handleMsg = createMsgHandler(this.proxy)

  private database: Database
  constructor(
    private fetch: SDKFetch,
    private net: Net,
    private mapToTable: TableInfoByMessageType
  ) {
    this.net.initMsgToDBHandler(this.handleMsgToDB)
  }

  destroy() {
    this._getUserMeStream.complete()
  }

  debug(): void {
    this._isDebug = true
    ctx['console']['log']('socket debug start')
  }

  setSocketUrl(url: string): void {
    this._socketUrl = url
  }

  async initClient(client: Consumer, userMe?: UserMe): Promise<void> {
    if (!userMe) {
      await this._getToken()
    } else {
      this._getUserMeStream.next(userMe)
    }
    this._client = client
    this._client._join = this._join.bind(this)
    this._client.onmessage = this._onmessage.bind(this)
    this._client.onopen = this._onopen.bind(this)
    this._getUserMeStream.subscribe(u => {
      this._client.getToken = () => {
        return u.snapperToken as string
      }
    })
  }

  initReactiveDB(database: Database) {
    this.database = database
    if (this._client) {
      this._client.onmessage = this._onmessage.bind(this)
    }
  }

  async connect(): Promise<void> {
    const userMe = await this._getUserMeStream
      .take(1)
      .toPromise()
    const auth = userMe.snapperToken.split('.')[1]
    const token: {
      exp: number
      userId: string
      source: 'teambition'
    } = JSON.parse(window.atob(auth))
    const expire = token.exp * 1000 - 3600000
    // token.exp * 1000 - 1 * 60 * 60 * 1000
    if (expire < Date.now()) {
      await this._getToken()
    }
    return this._connect()
  }

  /**
   * uri 格式: :type/:id
   * eg: projects, organizations/554c83b1b2c809b4715d17b0
   */
  join(uri: string): Consumer {
    if (this._joinedRoom.has(uri)) {
      return this._client
    }
    return this._client.join.call(this._client, uri)
  }

  leave(uri: string): Promise<void> {
    if (!this._consumerId) {
      return Promise.reject(new Error(`leave room failed, no consumerId`))
    }
    if (this._leavedRoom.has(uri)) {
      return Promise.resolve()
    }
    return this.fetch.leaveRoom(uri, this._consumerId)
      .then(() => {
        if (this._joinedRoom) {
          this._joinedRoom.delete(uri)
        }
        this._leavedRoom.add(uri)
      })
      .catch((e: any) => {
        console.error(e)
      })
  }

  // override Consumer onopen
  private _onopen(): void {
    this._joinedRoom.forEach(r => {
      this.fetch.joinRoom(r, this._consumerId)
    })
  }

  private _connect(): Promise<void> {
    return this._getUserMeStream
      .take(1)
      .toPromise()
      .then(userMe => {
        this._client
          .connect(this._socketUrl, {
            path: '/websocket',
            token: userMe.snapperToken as string
          })
      })
  }

  private _onmessage(event: Consumer.RequestEvent) {
    if (this._isDebug) {
      // 避免被插件清除掉
      ctx['console']['log'](JSON.stringify(event, null, 2))
    }

    return socketHandler(
      this.net,
      event,
      this.handleMsgToDB,
      this.handleMsg,
      this.mapToTable,
      this.database
    )
      .toPromise()
      .then(null, (err: any) => ctx['console']['error'](err))
  }

  private _getToken() {
    return this.fetch.getUserMe()
      .toPromise()
      .then((r: UserMe) => {
        this._getUserMeStream.next(r)
      })
  }

  private _join(room: string, consumerId: string): Promise<any> {
    this._consumerId = consumerId
    return this.fetch.joinRoom(room, consumerId)
      .then(() => {
        this._joinedRoom.add(room)
      })
      .catch(e => {
        console.error(e)
      })
  }
}

export function leaveRoom(
  this: SDKFetch,
  room: string,
  consumerId: string
) {
  // http delete 不允许有 body， 但是这里就是有 body
  return this.delete<void>(`${room}/subscribe`, { consumerId })
    .toPromise()
}

export function joinRoom(
  this: SDKFetch,
  room: string,
  consumerId: string
) {
  return this.post<void>(`${room}/subscribe`, { consumerId })
    .toPromise()
}

SDKFetch.prototype.leaveRoom = leaveRoom
SDKFetch.prototype.joinRoom = joinRoom

declare module '../SDKFetch' {
  /*tslint:disable no-shadowed-variable*/
  interface SDKFetch {
    joinRoom: typeof joinRoom
    leaveRoom: typeof leaveRoom
  }
}
