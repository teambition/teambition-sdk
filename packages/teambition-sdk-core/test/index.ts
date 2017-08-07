'use strict'
import { Database, DataStoreType } from 'reactivedb'
import { testable } from '../src/testable'
import { SDK } from '../src/index'

import './SDKFetch.spec'

testable.UseXMLHTTPRequest = false

export function createSdk() {
  const sdk = new SDK()

  const database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', 1)
  sdk.initReactiveDB(database)

  return sdk
}

export * from '../src/index'
export * from '../src/utils/index'
