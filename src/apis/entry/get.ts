import { Observable } from 'rxjs/Observable'
import { QueryToken } from '../../db'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { EntrySchema } from '../../schemas/Entry'
import { EntryId } from 'teambition-types'

export function getEntryFetch(
  this: SDKFetch,
  entryId: EntryId,
  query?: any
): Observable<EntrySchema> {
  return this.get<EntrySchema>(`entries/${entryId}`, query)
}

SDKFetch.prototype.getEntry = getEntryFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getEntry: typeof getEntryFetch
  }
}

export function getEntry (
  this: SDK,
  entryId: EntryId,
  query?: any
): QueryToken<EntrySchema> {
  return this.lift<EntrySchema>({
    request: this.fetch.getEntry(entryId, query || {}),
    cacheValidate: CacheStrategy.Cache,
    tableName: 'Entry',
    query: {
      where: { _id: entryId }
    },
  })
}

SDK.prototype.getEntry = getEntry

declare module '../../SDK' {
  interface SDK {
    getEntry: typeof getEntry
  }
}
