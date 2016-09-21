'use strict'
import 'rxjs/add/operator/toPromise'
import { Subject } from 'rxjs/Subject'
import UserFetch from '../fetchs/UserFetch'
import SocketFetch from '../fetchs/SocketFetch'
import { socketHandler } from './EventMaps'
import Consumer, { RequestEvent } from 'snapper-consumer'
import { UserMe } from '../schemas/UserMe'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

/* istanbul ignore next */
export class SocketClient {
  private _isDebug = false

  private _client: Consumer

  private _socketUrl = 'wss://push.teambition.com'

  private _me: UserMe
  private _consumerId: string

  private _getUserMeStream = new Subject<UserMe>()

  private _joinedRoom = new Set<string>()
  private _leavedRoom = new Set<string>()

  constructor() {
    this._getUserMeStream.subscribe(userMe => {
      this._me = userMe
    })
  }

  debug(): void {
    this._isDebug = true
    ctx['console']['log']('socket debug start')
  }

  setSocketUrl(url: string): void {
    this._socketUrl = url
  }

  initClient(client: Consumer): void {
    this._client = client
    this._client._join = this._join.bind(this)
    this._client.onmessage = this._onmessage.bind(this)
    this._client.onopen = this._onopen.bind(this)
    this._client['getToken'] = () => {
      if (this._me) {
        return this._me.snapperToken
      }else {
        return null
      }
    }
  }

  connect(): Promise<void> {
    if (!this._checkToken()) {
      return this._getToken()
        .then(() => {
          this._connect()
        })
    } else {
      return this._connect()
    }
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
    return SocketFetch.leave(uri, this._consumerId)
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
      SocketFetch.join(r, this._consumerId)
    })
  }

  private _connect(): Promise<void> {
    this._client
      .connect(this._socketUrl, {
        path: '/websocket',
        token: this._me.snapperToken
      })
    return Promise.resolve()
  }

  private _onmessage(event: RequestEvent) {
    if (this._isDebug) {
      // 避免被插件清除掉
      ctx['console']['log'](JSON.stringify(event, null, 2))
    }
    return socketHandler(event)
      .toPromise()
      .then(null, (err: any) => ctx['console']['error'](err))
  }

  private _checkToken(): void {
    if (!this._me) {
      this._getToken()
    } else {
      const auth = this._me.snapperToken.split('.')[1]
      const token: {
        exp: number
        userId: string
        source: 'teambition'
      } = JSON.parse(window.atob(auth))
      const expire = token.exp * 1000 - 3600000
      // token.exp * 1000 - 1 * 60 * 60 * 1000
      if (expire < Date.now()) {
        this._getToken()
      }
    }
  }

  private _getToken(): Promise<void> {
    return UserFetch.getUserMe()
      .then(r => {
        this._getUserMeStream.next(r)
      })
  }

  private _join (room: string, consumerId: string): Promise<any> {
    this._consumerId = consumerId
    return SocketFetch.join(room, consumerId)
      .then(() => {
        this._joinedRoom.add(room)
      })
      .catch(e => {
        console.error(e)
      })
  }
}
