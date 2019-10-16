import { Observable } from 'rxjs/Observable'
import { QueryToken } from '../../db'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { TestcaseSchema } from '../../schemas/Testcase'
import { TestcaseId } from 'teambition-types'

export function getTestcaseFetch(
  this: SDKFetch,
  testcaseId: TestcaseId,
  query?: any
): Observable<TestcaseSchema> {
  return this.get<TestcaseSchema>(`testcases/${testcaseId}`, query)
}

SDKFetch.prototype.getTestcase = getTestcaseFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getTestcase: typeof getTestcaseFetch
  }
}

export function getTestcase (
  this: SDK,
  testcaseId: TestcaseId,
  query?: any
): QueryToken<TestcaseSchema> {
  return this.lift<TestcaseSchema>({
    request: this.fetch.getTestcase(testcaseId, query || {}),
    cacheValidate: CacheStrategy.Cache,
    tableName: 'Testcase',
    query: {
      where: { _id: testcaseId }
    },
  })
}

SDK.prototype.getTestcase = getTestcase

declare module '../../SDK' {
  interface SDK {
    getTestcase: typeof getTestcase
  }
}
