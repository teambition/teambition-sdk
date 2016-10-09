'use strict'
import Fetch from './BaseFetch'

export class SocketFetch extends Fetch {
  join(room: string, consumerId: string): Promise<void> {
    return this.fetch.post<void>(`${room}/subscribe`, {
      consumerId: consumerId
    })
      .toPromise()
  }

  leave(room: string, consumerId: string): Promise<void> {
    // http delete 不允许有 body， 但是这里就是有 body
    return (<any>this.fetch.delete)(`${room}/subscribe`, {
      consumerId
    })
  }
}

export default new SocketFetch()
