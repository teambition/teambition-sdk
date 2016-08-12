'use strict'
import { FileRes } from './FileFetch'
import UserFetch from './UserFetch'

export class StrikerFetch {

  private _strikerApiHost = 'https://striker.teambition.net'

  /* istanbul ignore next */
  setHost(host: string) {
    this._strikerApiHost = host
  }

  upload(file: File): Promise<FileRes> {
    let formData: any
    /* istanbul ignore if */
    if (typeof FormData !== 'undefined') {
      formData = new FormData()
      formData.append('size', file.size)
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('type', file.type)
    } else {
      formData = file
    }
    return UserFetch.getUserMe()
      .then(userme => {
        return fetch(`${this._strikerApiHost}/upload`, {
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
        /** istanbul ignore if */
        }else {
          return Promise.reject(resp)
        }
      })
  }
}

export default new StrikerFetch()
