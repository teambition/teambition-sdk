# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.6.21"></a>
## [0.6.21](https://github.com/teambition/teambition-sdk/compare/v0.6.20...v0.6.21) (2018-04-27)


### Bug Fixes

* **apis/CustomFieldAPI:** 确保将 `updateTaskCustomField()` 返回结果存入缓存 ([c32d44a](https://github.com/teambition/teambition-sdk/commit/c32d44a))


### Features

* **apis/ScenarioFieldConfigAPI:** 添加 `getScenarioFieldConfigs()` 接口 ([18295d5](https://github.com/teambition/teambition-sdk/commit/18295d5))
* **apis/TagAPI:** 添加 `getTags()` 接口 ([078a8b7](https://github.com/teambition/teambition-sdk/commit/078a8b7))
* **apis/TaskAPI:** 添加 `updateStartDate()` 接口 ([c2e398b](https://github.com/teambition/teambition-sdk/commit/c2e398b))



<a name="0.6.20"></a>
## [0.6.20](https://github.com/teambition/teambition-sdk/compare/v0.6.19...v0.6.20) (2018-04-26)


### Bug Fixes

* **api/CustomFieldAPI:** 更正 `CustomFieldAPI` 命名 ([d20831a](https://github.com/teambition/teambition-sdk/commit/d20831a))



<a name="0.6.19"></a>
## [0.6.19](https://github.com/teambition/teambition-sdk/compare/v0.6.18...v0.6.19) (2018-04-26)


### Bug Fixes

* **apis/CustomFieldLinkAPI:** 确保 `CustomFieldLinkApi` 被导出 ([b8e95d9](https://github.com/teambition/teambition-sdk/commit/b8e95d9))



<a name="0.6.18"></a>
## [0.6.18](https://github.com/teambition/teambition-sdk/compare/v0.6.17...v0.6.18) (2018-04-26)


### Features

* **apis/CustomFieldLinkAPI:** 添加 `getProjectCustomFieldLinks()` 接口 ([161d6ea](https://github.com/teambition/teambition-sdk/commit/161d6ea))
* **apis/TaskAPI:** 添加 `getMyTasksByType()` 接口 ([6d05817](https://github.com/teambition/teambition-sdk/commit/6d05817))



<a name="0.6.17"></a>
## [0.6.17](https://github.com/teambition/teambition-sdk/compare/v0.6.16...v0.6.17) (2018-04-25)


### Bug Fixes

* **schemas/schema:** 明确变量类型，避免 `noImplicitAny` 问题 ([fc1670c](https://github.com/teambition/teambition-sdk/commit/fc1670c))



<a name="0.6.16"></a>
## [0.6.16](https://github.com/teambition/teambition-sdk/compare/v0.6.15...v0.6.16) (2018-04-25)


### Bug Fixes

* **schemas:** 更新 Task 定义，添加 TaskflowStatus 定义 ([36647a3](https://github.com/teambition/teambition-sdk/commit/36647a3))



<a name="0.6.15"></a>
## [0.6.15](https://github.com/teambition/teambition-sdk/compare/v0.6.14...v0.6.15) (2018-04-23)


### Bug Fixes

* **schemas/Project:** 导出 `ProjectApplication` 定义 ([ee159c2](https://github.com/teambition/teambition-sdk/commit/ee159c2))



<a name="0.6.14"></a>
## [0.6.14](https://github.com/teambition/teambition-sdk/compare/v0.6.13...v0.6.14) (2018-04-23)


### Bug Fixes

* **schemas:** 更新 `Organization` 和 `Project` 定义 ([ada00c5](https://github.com/teambition/teambition-sdk/commit/ada00c5))



<a name="0.6.13"></a>
## [0.6.13](https://github.com/teambition/teambition-sdk/compare/v0.6.12...v0.6.13) (2018-04-18)


### Bug Fixes

* **schemas/Member:** 更新定义，修复相关测试 ([df76110](https://github.com/teambition/teambition-sdk/commit/df76110))
* **storage/Database:** 避免“‘并行请求’致使‘Collection 重复创建’而导致数据无法更新”问题 ([2189e6f](https://github.com/teambition/teambition-sdk/commit/2189e6f))



<a name="0.6.12"></a>
## [0.6.12](https://github.com/teambition/teambition-sdk/compare/v0.6.11...v0.6.12) (2018-04-13)


### Bug Fixes

* **fetchs/TaskFetch:** 校正“收藏”相关接口返回值 ([8e2db2d](https://github.com/teambition/teambition-sdk/commit/8e2db2d))
* **schemas/Member:** 更新定义 ([00c2953](https://github.com/teambition/teambition-sdk/commit/00c2953))
* **schemas/UserMe:** 更新定义 ([8e794ad](https://github.com/teambition/teambition-sdk/commit/8e794ad))
