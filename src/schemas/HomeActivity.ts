import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { ExecutorOrCreator, ProjectId, UserId } from 'teambition-types'
import {
  MemberSchema, TaskSchema, EventSchema, FileSchema, CollectionSchema,
  TasklistSchema, TagSchema, ProjectSchema, OrganizationSchema, TeamSchema,
} from '.'
import { EntryData } from './Entry'
import { ApplicationSchema } from './Application'

export interface HomeActivityContent {
  // 成员
  user?: Pick<MemberSchema, '_id' | 'name' | 'email' | 'avatarUrl'>

  // 项目成员邀请
  users?: Pick<MemberSchema, '_id' | 'name' | 'email' | 'avatarUrl'>[]
  userNames?: string[]
  source?: string

  // 任务
  task?: Pick<TaskSchema, '_id' | 'content' | 'uniqueId'>

  // 分享
  post?: Pick<EventSchema, '_id' | 'endDate' | 'isAllDay' | 'startDate' | 'title'>

  // 日程
  event?: Pick<EventSchema, '_id' | 'title' | 'startDate' | 'endDate' | 'isAllDay'>

  // 文件
  work?: Pick<FileSchema, '_id' | 'fileName' | 'fileCategory' | 'fileType' | 'thumbnail'>
  works?: Pick<FileSchema, '_id' | 'fileName' | 'fileCategory' | 'fileType' | 'thumbnail'>[]

  // 记账
  entry?: Pick<EntryData, '_id' | 'content' | 'amount' | 'type'>

  // 文件夹
  collection?: Pick<CollectionSchema, '_id' | 'title'>

  // 任务分组
  tasklist?: Pick<TasklistSchema, '_id' | 'title'>

  // 标签
  tag?: Pick<TagSchema, '_id' | 'name'>

  // 项目
  project?: Pick<ProjectSchema, '_id' | 'name' | 'description' | 'logo' | 'visibility'>

  // 应用
  application?: Pick<ApplicationSchema, '_id' | 'name'>

  // 企业
  organization?: Pick<OrganizationSchema, '_id' | 'name'>

  // 部门
  team?: Pick<TeamSchema, '_id' | 'name' | 'type'>

  // 创建者名字（必有）
  creator: string
}

export interface HomeActivitySchema {
  _boundToObjectId: string
  _creatorId: UserId
  _id: string
  action: string
  boundToObjectType: string
  content: HomeActivityContent
  created: string
  creator: ExecutorOrCreator
  rawAction: string // deprecated
  rootId: ProjectId // project#:_projectId
  title: string
  updated: string
}

const schema: SchemaDef<HomeActivitySchema> = {
  _boundToObjectId: { type: RDBType.STRING },
  _creatorId: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  action: { type: RDBType.STRING },
  boundToObjectType: { type: RDBType.STRING },
  content: { type: RDBType.OBJECT },
  created: { type: RDBType.DATE_TIME },
  creator: {
    type: RDBType.OBJECT,
    // type: Relationship.oneToOne,
    // virtual: {
    //   name: 'User',
    //   where: (userTable: any) => {
    //     console.info(userTable)
    //     return ({
    //       _creatorId: userTable._id
    //     })
    //   }
    // }
  },
  rawAction: { type: RDBType.STRING },
  rootId: { type: RDBType.STRING },
  title: { type: RDBType.STRING },
  updated: { type: RDBType.DATE_TIME },
}

schemaColl.add({ schema, name: 'HomeActivity' })
