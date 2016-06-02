'use strict'
import UserFetch from '../fetchs/UserFetch'
import ProjectFetch from '../fetchs/ProjectFetch'
import { socketHandler } from './EventMaps'
import { default as Consumer , RequestEvent } from 'snapper-consumer'

declare const global: any

const socketUrl = 'wss://push.teambition.com'

export class SocketClient {

  private _client: Consumer

  private _isDebug = false

  private _isSubscribe = false

  public debug() {
    this._isDebug = true
  }

  connect(client: Consumer): Promise<any> {
    this._client = this._client ? this._client : client
    this._client._join = this._join
    this._client.onmessage = this._onmessage
    return UserFetch.getUserMe()
      .then(userMe => {
        return this._client
          .connect(socketUrl, {
            path: '/websocket',
            token: userMe.snapperToken
          })
      }).then(() => {
        return this.join()
      })
  }

  join(): Consumer {
    if (this._isSubscribe) {
      return this._client
    }
    this._isSubscribe = true
    return this._client.join.call(this._client)
  }

  private _onmessage(event: RequestEvent) {
    return socketHandler(event).subscribe(r => {
      if (this._isDebug) {
        const ctx = typeof global === 'undefined' ? window : global
        // 避免被插件清除掉
        ctx['console']['log']({
          originEvent: event,
          result: r
        })
      }
    })
  }

  /**
   * 由于新的 API 可以一次性订阅所有项目的 socket，参数中 _projectId 其实已经没用了
   * 但是由于 snapper-consumer 的内部设计只能先保留这个参数
   */
  private _join (_projectId: string, consumerId: string): Promise<any> {
    if (!_projectId) {
      return ProjectFetch.subscribeSocket(consumerId)
    }
    return
  }
}
