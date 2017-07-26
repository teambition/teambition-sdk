import { UserMe } from '../schemas/UserMe'

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
