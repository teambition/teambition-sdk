'use strict'
import { Database, DataStoreType } from 'reactivedb'
import { testable } from '../src/testable'
import '../src/apis/index'
import { SDK } from '../src/app'

testable.UseXMLHTTPRequest = false

export function createSdk() {
  const sdk = new SDK(
    new Database(DataStoreType.MEMORY, false, 'teambition-sdk', 1)
  )
  return sdk
}

export * from '../src/app'
export * from '../src/utils/index'
export * from '../mock/index'
