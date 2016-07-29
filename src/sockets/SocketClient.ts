'use strict'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'
import UserFetch from '../fetchs/UserFetch'
import ProjectFetch from '../fetchs/ProjectFetch'
import { socketHandler } from './EventMaps'
import Consumer, { RequestEvent } from 'snapper-consumer'
import { UserMe } from '../schemas/UserMe'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

/* istanbul ignore next */
export class SocketClient {

  private static _isDebug = false

  private static _isSubscribe = false

  private _client: Consumer

  private _socketUrl = 'wss://push.teambition.com'

  private _me: UserMe

  private _getUserMeStream = new Subject<UserMe>()

  /**
   * 由于新的 API 可以一次性订阅所有项目的 socket，参数中 _projectId 其实已经没用了
   * 但是由于 snapper-consumer 的内部设计只能先保留这个参数
   */
  private static _join (_projectId: string, consumerId: string): Promise<any> {
    return ProjectFetch.subscribeSocket(consumerId).catch(e => {
      SocketClient._isSubscribe = false
    })
  }

  constructor() {
    this._getUserMeStream.subscribe(userMe => {
      this._me = userMe
    })
  }

  debug(): void {
    SocketClient._isDebug = true
    ctx['console']['log']('socket debug start')
  }

  setSocketUrl(url: string): void {
    this._socketUrl = url
  }

  initClient(client: Consumer): void {
    this._client = client
    this._client._join = SocketClient._join
    this._client.onmessage = this._onmessage
    this._client['getToken'] = () => {
      if (this._me) {
        return this._me.snapperToken
      }else {
        return null
      }
    }
  }

  connect(): Promise<any> | Consumer {
    if (!this._checkToken()) {
      return this._getToken()
        .then(() => {
          this._connect()
        })
    } else {
      return this._connect()
    }
  }

  join(): Consumer {
    if (SocketClient._isSubscribe) {
      return this._client
    }
    SocketClient._isSubscribe = true
    return this._client.join.call(this._client)
  }

  isSubscribed() {
    return SocketClient._isSubscribe
  }

  private _connect() {
    this._client
      .connect(this._socketUrl, {
        path: '/websocket',
        token: this._me.snapperToken
      })
    return this.join()
  }

  private _onmessage(event: RequestEvent) {
    if (SocketClient._isDebug) {
      // 避免被插件清除掉
      ctx['console']['log'](event)
    }
    const subscription = socketHandler(event)
      .subscribe(null, err => ctx['console']['error'](err), () => {
        if (subscription instanceof Subscription) {
          subscription.unsubscribe()
        }
      })
    return subscription
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
}
