import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import * as Consumer from 'snapper-consumer'
import { SDKFetch } from '../SDKFetch'
import { UserMe, SnapperToken, TCMToken } from '../schemas/UserMe'

export type TokenField = keyof Pick<UserMe, 'snapperToken' | 'tcmToken'>

export const userField = (isLegacyMode: boolean): TokenField =>
  isLegacyMode ? 'snapperToken' : 'tcmToken'

const expireInMs = 1 * 60 * 60 * 1000

export const isValid = (token: string): boolean => {
  const auth = token.split('.')[1]
  if (!auth) {
    return false
  }

  const expirationInSec = JSON.parse(window.atob(auth)).exp
  if (!expirationInSec) {
    return false
  }

  return Date.now() < expirationInSec * 1000 - expireInMs
}

export const refreshTCMToken = (client: Consumer): Promise<TCMToken> => {
  return new Promise<string>((resolve, reject) => {
    client.request('refresh_token', [], (err, res: string) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export function fetchToken(sdkFetch: SDKFetch, isLegacyMode: true): Promise<SnapperToken>
export function fetchToken(sdkFetch: SDKFetch, isLegacyMode: false): Promise<TCMToken>
export function fetchToken(sdkFetch: SDKFetch): Promise<TCMToken>
export function fetchToken(sdkFetch: SDKFetch, isLegacyMode: boolean): Promise<SnapperToken | TCMToken>
export async function fetchToken(sdkFetch: SDKFetch, isLegacyMode = false) {
  const me =  await sdkFetch.getUserMe().send().toPromise()
  return me[userField(isLegacyMode)]
}

export class ValidToken {

  private validToken: string
  private subscription: Subscription

  constructor(
    private httpClient: SDKFetch,
    private wsClient: Consumer,
    private isLegacyMode: boolean,
    private refreshInterval: number,
    initialValidToken: string
  ) {
    this.validToken = initialValidToken
    this.subscription =
      Observable.interval(this.refreshInterval)
        .switchMap(() => Observable.fromPromise<string>(
          this.isLegacyMode
            ? fetchToken(this.httpClient, this.isLegacyMode)
            : refreshTCMToken(this.wsClient)
        ))
        .subscribe((validToken) => {
          this.validToken = validToken
        })
  }

  get = (): string => this.validToken

  destroy() {
    this.subscription.unsubscribe()
  }
}

export const setUpValidTokenStream = async (
  httpClient: SDKFetch,
  wsClient: Consumer,
  isLegacyMode: boolean,
  refreshInterval: number
): Promise<ValidToken> => {
  const initialValidToken = await fetchToken(
    httpClient,
    isLegacyMode
  ) as string

  return new ValidToken(
    httpClient,
    wsClient,
    isLegacyMode,
    refreshInterval,
    initialValidToken
  )
}
