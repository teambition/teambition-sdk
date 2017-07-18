import { SDKFetch } from '../SDKFetch'

export class SocketFetch extends SDKFetch {
  join(room: string, consumerId: string): Promise<void> {
    return this.post<void>(`${room}/subscribe`, {
      consumerId: consumerId
    })
    .toPromise()
  }

  leave(room: string, consumerId: string): Promise<void> {
    // http delete 不允许有 body， 但是这里就是有 body
    return this.delete<void>(`${room}/subscribe`, {
      consumerId
    })
    .toPromise()
  }
}

export default new SocketFetch()
