/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />
'use strict'
import { setToken, setAPIHost } from 'teambition-sdk'

setToken('GPUXVXGmw80g3NXGDjoy4myNIXE=puqCzvUC3bf16cb4ebc4bfab1b7cfbddf5eba58ce0faf0d1e0ac47e4b11ce800bca1075bef784b5f2f482c7b88d99b783c09c8a79142fc0482599314e3a7659f74d04426a047983e82eff41c6525a0187e32b3d2db7f802571bbde66a78ffd0a0f57ea4d')
setAPIHost('http://project.ci/api/')

export * from './apis/UserApi'

mocha.run()
