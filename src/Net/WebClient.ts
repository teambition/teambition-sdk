import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { Network } from './Network'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface HttpErrorMessage {
  method: AllowedHttpMethod
  url: string
  error: Response
  body?: any
  [userDefinedKey: string]: any
}

export type MethodParams = {
  url: string,
  body?: any,
  _opts: any,
  includeHeaders: boolean
}

export interface HttpResponseWithHeaders<T = any> {
  headers: Headers,
  body: T
}

export const getClientInstance = <T>(
  WebClientFactory: new <D>(...arg: any) => WebClient<D>,
  WithResponseHeaders: boolean,
  url?: string,
  errorAdapter$?: Subject<HttpErrorMessage>,
) => {
  if (WithResponseHeaders) {
    return new WebClientFactory<HttpResponseWithHeaders<T>>(url, errorAdapter$, true)
  } else {
    return new WebClientFactory<T>(url, errorAdapter$)
  }
}

export const HttpError$ = new Subject<HttpErrorMessage>() as any as Observable<HttpErrorMessage>

export abstract class WebClient<T> extends Network<T> {
  protected cloned = false
  protected request: Observable<T> | undefined
  protected abstract _opts: any

  // todo(dingwen): 实现更可控、支持多层叠加的 interceptor
  // map<U>(fn: (stream$: Observable<T>) => Observable<U>) {
  //   this.mapFn = fn
  //   return this as any as Http<U>
  // }
  public mapFn: (v$: Observable<T>) => Observable<any> = (dist$ => dist$)

  constructor(
    protected url: string = '',
    protected errorAdapter$: Subject<HttpErrorMessage> = HttpError$ as Subject<HttpErrorMessage>,
    protected readonly includeHeaders: boolean = false
  ) {
    super()
  }

  protected setParams(opts: Record<string, any>) {
    this._opts = { ...this._opts, ...opts }
    return this
  }

  setUrl(url: string) {
    this.url = url
    return this
  }

  setHeaders(headers: any) {
    const newHeaders = { ...this._opts.headers, ...headers }
    return this.setParams({ headers: newHeaders })
  }

  setToken(token: string) {
    delete this._opts.credentials
    const newHeaders = {
      ...this._opts.headers,
      Authorization: `OAuth2 ${token}`
    }
    return this.setParams({ headers: newHeaders })
  }

  setOpts(opts: any) {
    return this.setParams(opts)
  }

  abstract restore(): this

  get() {
    return this.prepareRequest('get')
  }

  post(body?: any) {
    return this.prepareRequest('post', body)
  }

  put(body?: any) {
    return this.prepareRequest('put', body)
  }

  delete(body?: any) {
    return this.prepareRequest('delete', body)
  }

  send(): Observable<T> {
    if (!this.request) {
      return Observable.empty<T>()
    }
    const response$ = this.mapFn(this.request)
    return response$
      .catch((msg: HttpErrorMessage) => {
        const msgClone = { ...msg, error: msg.error.clone() }
        setTimeout(() => {
          this.errorAdapter$.next(msgClone)
        }, 10)
        return Observable.throw(msg)
      })
  }

  protected get params(): MethodParams {
    return {
      url: this.url,
      _opts: this._opts,
      includeHeaders: this.includeHeaders
    }
  }
}
