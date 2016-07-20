'use strict'
import UserFetch from '../fetchs/UserFetch'
import ProjectFetch from '../fetchs/ProjectFetch'
import { socketHandler } from './EventMaps'
import Consumer, { RequestEvent } from 'snapper-consumer'

declare const global: any

const ctx = typeof global === 'undefined' ? window : global

export class SocketClient {

  private static _isDebug = false

  private static _isSubscribe = false

  private _client: Consumer

  private _socketUrl = 'wss://push.teambition.com'

  /**
   * 由于新的 API 可以一次性订阅所有项目的 socket，参数中 _projectId 其实已经没用了
   * 但是由于 snapper-consumer 的内部设计只能先保留这个参数
   */
  private static _join (_projectId: string, consumerId: string): Promise<any> {
    return ProjectFetch.subscribeSocket(consumerId).catch(e => {
      SocketClient._isSubscribe = false
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
  }

  connect(): Promise<any> {
    return UserFetch.getUserMe()
      .then(userMe => {
        return this._client
          .connect(this._socketUrl, {
            path: '/websocket',
            token: userMe.snapperToken
          })
      }).then(() => {
        return this.join()
      })
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

  private _onmessage(event: RequestEvent) {
    if (SocketClient._isDebug) {
      // 避免被插件清除掉
      ctx['console']['log'](event)
    }
    return socketHandler(event).subscribe(null, err => ctx['console']['error'](err))
  }
}
