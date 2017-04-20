'use strict'
import { Database, DataStoreType } from 'reactivedb'
import { testable } from '../src/testable'
import { SDK } from '../src/index'

testable.UseXMLHTTPRequest = false

export function createSdk() {
  const sdk = new SDK()

  const database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', 1)
  sdk.initReactiveDB(database)

  return sdk
}

export function createSdkWithoutRDB() {
  return new SDK()
}

export function loadRDB(sdk: SDK) {
  const database = new Database(DataStoreType.MEMORY, false, 'teambition-sdk', 1)
  return sdk.initReactiveDB(database)
}

export * from '../src/index'
export * from '../src/utils/index'
export * from '../mock/index'
