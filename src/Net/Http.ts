import { Subject } from 'rxjs/Subject'
import * as fetchClient from './FetchClient'

export class Http<T> extends fetchClient.FetchClient<T> {
  protected client = Http
}

export const getHttpWithResponseHeaders = <T>(
  url?: string,
  errorAdapter$?: Subject<fetchClient.FetchClientErrorMessage>
): fetchClient.FetchClient<fetchClient.FetchClientResponseWithHeaders<T>> => {
  return new fetchClient.FetchClient<fetchClient.FetchClientResponseWithHeaders<T>>(url, errorAdapter$, true)
}

export * from './FetchClient'
