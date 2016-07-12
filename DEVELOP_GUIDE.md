# 目录结构
```
├── node_modules
├── package.json
├── tsconfig.json
├── tslint.json
├── typings.json
├── mock
│   ├── backend.ts
│   ├── index.ts
│   ├── mock.ts
│   ├── response.ts
│   ├── utils.ts
├── src
│   ├── apis
│   ├── decorators
│   ├── fetchs
│   ├── models
│   ├── schemas
│   ├── sockets
│   ├── storage
│   ├── utils
│   ├── app.ts
│   ├── SocketApp.ts
│   ├── teambition.ts
├── test
│   ├── unit
│   ├── mock
│   └── e2e
```

# 程序结构
## 获取数据
以获取一条任务数据为例
首先调用 `TaskAPI.get(taskId)` 方法，API 内的这个方法会首先判断是否有已经缓存了的此条 `task`。第一次调用这个接口时并不存在缓存的此条 `task`，则通过 `TaskFetch.get(taskId)` 方法通过向服务器请求得到数据:

```json
{
  "_id": "569dc0cb0fafba0857158d84",
  "_creatorId": "56986d43542ce1a2798c8cfb",
  "_executorId": "56986d43542ce1a2798c8cfb",
  "_projectId": "56988fb705ead4ae7bb8dcfe",
  "_tasklistId": "56988fb7644284a37be3ba6f",
  "tagIds": [],
  "_stageId": "56988fb7644284a37be3ba72",
  "visiable": "members",
  "visible": "members",
  "involveMembers": [
    "56986d43542ce1a2798c8cfb"
  ],
  "updated": "2016-02-25T09:27:16.258Z",
  "created": "2016-01-19T04:51:23.040Z",
  "isArchived": "false",
  "isDone": false,
  "priority": 1,
  "dueDate": null,
  "accomplished": null,
  "note": "",
  "content": "加拉克苏斯大王",
  "_sourceId": null,
  "sourceDate": null,
  "subtasks": [],
  "commentsCount": 0,
  "attachmentsCount": 0,
  "likesCount": 0,
  "objectlinksCount": 0,
  "subtaskCount": {
    "total": 0,
    "done": 0
  },
  "creator": {
    "name": "龙逸楠",
    "avatarUrl": "",
    "_id": "56986d43542ce1a2798c8cfb"
  },
  "stage": {
    "name": "影月谷",
    "_id": "56988fb7644284a37be3ba72"
  },
  "executor": {
    "name": "龙逸楠",
    "avatarUrl": "",
    "_id": "56986d43542ce1a2798c8cfb"
  },
  "isFavorite": false
}
```

在从服务器取到这条数据后，它将会被传给相应的数据模型处理，这里是 `TaskModel.addOne`。在 `TaskModel.addOne` 方法中, 数据被转换成对应的 `Schema`对象，并存入 `Database` 中。在存入 `Database` 的过程中，这个 `Schema` 上所有带 `_id` 的子对象(也可指定为其它 key )将会被索引并存储，以便后续的更新。在存储的过程中，这些对象(TaskSchema 对象以及它的子对象)被转换成 `Database` 中的 `Model` 对象。并在 `Model` 中存储相应的 `parents` 与 `children` 索引,以便后续更新时能通知到与之关联的对象。

存储完成后,`Database` 返回一个持续发射信号的 `Observable` 对象, 这个 `Observable` 是 *Storage* 目录下的 `Model` 对象返回的, 将会被返回给 API 调用者。

## 更新
当这条已经被缓存的任务被更新时(通过网络请求 或者 Socket), 更新者通过将 `patch` 传入相应的 `Model` 的 `update` 方法中，这里是 `TaskModel.update(id, patch)`。而 `Model` 会调用 `Database` 中的 `updateOne` 方法。

`Database` 在更新数据时，会产生这样几个流:
- 通知自身 `Model` 更新的流，通过这个流只要订阅过这条数据的地方都会收到更新后的对象拷贝
- 通知它的 `parents` 更新的流，通过这个流任何包含了这个对象的父对象会收到更新后的对象拷贝
- 判断更新后的数据是否满足存有此类 `Schema` 的 `Collection` 的条件的流。比如变更了 `Tasklistid` 后应该不满足先前存储它的 `Collecion` 条件但会变得满足进入另一个 `Collection` 的条件。
- 判断变更后数据是否符合原来存储它的 `Collection` 条件的流。

在 `Database` 中，这几个流被 `merge` 到一起。在 `Database.updateOne` 被调用时 ，会返回一个 cold `Observable` 对象，这个 `Observable` 对象被订阅时，之前 merge 到一起的各个流会被直接 `forEach` ，并且它的值会通过 `Observable` 发射出去。

所以通过 `API` 更新一个数据后的流是一个 `cold signal`，只会收到一次通知。

## 删除
当调用 `API` 上相关的删除方法时，`API` 会通过相应的数据模型调用 `Database` 上的 `delete` 方法。

Database 在删除一条任务时，会产生这样几个流:

- 从这个 Model 的 `children` 上的 `parent` 把自己的索引删除的流。因为它被从缓存中移除，所以任何它原来的 `children` 的变更都不应该再通知它。
- 从这个 Model 的 `parent` 上的 `children` 把自己的索引删除的流。因为它被从缓存中移除，它不会再有变更信息会被通知给它原来的 `parent`。
- 将 Model 从包含它的 `Collection` 中删除的流。它包含在哪个 `Collection` 是在存储 `Collection` 的过程中或 `Model` update 的过程中在 `Model` 上建立索引的。

这个三个流在 `Database.delete` 中被 `merge` 成一个流，并在 `delete` 方法返回的 `Observable` 被订阅时被订阅。
