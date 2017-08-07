import { ExecutorOrCreator, ProjectId } from 'teambition-types'

export interface HomeActivitySchema {
  _id: string
  _creatorId: string
  action: string
  content: {

    // 成员
    user?: {
      _id: string
      email: string
      name: string
      avatarUrl: string
    }

    // 项目成员邀请
    users?: {
      _id: string
      email: string
      name: string
      avatarUrl: string
    }[]
    userNames?: string[]
    source?: string

    // 任务
    task?: {
      _id: string
      content: string
    }

    // 分享
    post?: {
      _id: string
      title: string
    }

    // 日程
    event?: {
      _id: string
      title: string
      startDate: string
      endDate: string
    }

    // 文件
    work?: {
      _id: string
      fileName: string
    }
    works?: {
      _id: string
      fileName: string
      fileType: string
      fileCategory: string
      thumbnail: string
    }[]

    // 记账
    entry?: {
      _id: string
      content: string
      amount: string
      type: string
    }

    // 文件夹
    collection?: {
      _id: string
      title: string
    }

    // 任务分组
    tasklist?: {
      _id: string
      title: string
    }

    // 标签
    tag?: {
      _id: string
      name: string
    }

    // 项目
    project?: {
      _id: string
      name?: string
      description?: string
      logo?: string
      visibility?: string
    }

    // 应用
    application?: {
      _id: string
      name: string
    }

    // 企业
    organization?: {
      _id: string
      name: string
    }

    // 部门
    team?: {
      _id: string
      name: string
    }

    // 创建者名字（必有）
    creator: string
  }
  rootId: ProjectId              // project#:_projectId
  created: string
  _boundToObjectId: string
  boundToObjectType: string
  rawAction: string           // deprecated
  creator: ExecutorOrCreator
  title: string
}
