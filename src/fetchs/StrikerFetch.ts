'use strict'
import { FileRes } from './FileFetch'
import UserFetch from './UserFetch'

export class StrikerFetch {

  private _strikerApiHost = 'https://striker.teambition.net/'

  setHost(host: string) {
    this._strikerApiHost = host
  }

  upload(file: File): Promise<FileRes> {
    const formData = new FormData()
    formData.append('size', file.size)
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('type', file.type)
    return UserFetch.getUserMe()
      .then(userme => {
        return fetch(this._strikerApiHost, {
          headers: {
            'Authorization': userme.strikerAuth
          },
          method: 'post',
          body: formData
        })
      })
      .then(resp => {
        const status = resp.status
        if (status >= 200 && status < 400) {
          return resp.json()
        }else {
          return Promise.reject(resp)
        }
      })
  }
}

export default new StrikerFetch()
