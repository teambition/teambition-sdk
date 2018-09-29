import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { ApplicationSchema } from './Application'
import { CollectionSchema } from './Collection'
import { EntryData } from './Entry'
import { EventSchema } from './Event'
import { FileSchema } from './File'
import { OrganizationSchema } from './Organization'
import { PostSchema } from './Post'
import { ProjectSchema } from './Project'
import { TaskSchema } from './Task'
import { TagSchema } from './Tag'
import { TasklistSchema } from './Tasklist'
import { TeamSchema } from './Team'
import { UserMe } from './UserMe'

import { ExecutorOrCreator, ProjectId, UserId } from 'teambition-types'

export namespace HomeActivityType {
  // 必有字段
  export type Common = {
    creator: string // 创建者名字
  }

  // 成员
  export type User = {
    type: 'user'
    content: Common & {
      user: Pick<UserMe, '_id' | 'name' | 'email' | 'avatarUrl'>
    }
  }

  // 项目成员邀请
  export type Invite = {
    type: 'users'
    content: Common & {
      users: Pick<UserMe, '_id' | 'name' | 'email' | 'avatarUrl'>[]
      userNames: string[]
      source: string
    }
  }

  // 任务
  export type Task = {
    type: 'task'
    content: Common & {
      task: Pick<TaskSchema, '_id' | 'content' | 'uniqueId'>
    }
  }

  // 分享
  export type Post = {
    type: 'post'
    content: Common & {
      post: Pick<PostSchema, '_id' | 'title'>
    }
  }

  // 日程
  export type Event = {
    type: 'event'
    content: Common & {
      event: Pick<EventSchema, '_id' | 'title' | 'startDate' | 'endDate' | 'isAllDay'>
    }
  }

  // 文件
  export type Work = {
    type: 'work'
    content: Common & {
      work: Pick<FileSchema, '_id' | 'fileName' | 'fileCategory' | 'fileType' | 'thumbnail'>
    }
  }
  export type Works = {
    type: 'works'
    content: Common & {
      works: Pick<FileSchema, '_id' | 'fileName' | 'fileCategory' | 'fileType' | 'thumbnail'>[]
    }
  }

  // 记账
  export type Entry = {
    type: 'entry'
    content: Common & {
      entry: Pick<EntryData, '_id' | 'content' | 'amount' | 'type'>
    }
  }

  // 文件夹
  export type Collection = {
    type: 'collection'
    content: Common & {
      collection: Pick<CollectionSchema, '_id' | 'title'>
    }
  }

  // 任务分组
  export type Tasklist = {
    type: 'tasklist'
    content: Common & {
      tasklist: Pick<TasklistSchema, '_id' | 'title'>
    }
  }

  // 标签
  export type Tag = {
    type: 'tag'
    content: Common & {
      tag: Pick<TagSchema, '_id' | 'name'>
    }
  }

  // 项目
  export type Project = {
    type: 'project'
    content: Common & {
      project: Pick<ProjectSchema, '_id' | 'name' | 'description' | 'logo' | 'visibility'>
    }
  }

  // 应用
  export type Application = {
    type: 'application'
    content: Common & {
      application: Pick<ApplicationSchema, '_id' | 'name'>
    }
  }

  // 企业
  export type Organization = {
    type: 'organization'
    content: Common & {
      organization: Pick<OrganizationSchema, '_id' | 'name'>
    }
  }

  // 部门
  export type Team = {
    type: 'team'
    content: Common & {
      team: Pick<TeamSchema, '_id' | 'name' | 'type'>
    }
  }

  export type Union =
    | User | Invite
    | Task | Post | Event | Work | Works | Collection | Entry
    | Tasklist | Tag | Project | Application | Organization | Team
}

export type HomeActivityBase = {
  _boundToObjectId: ProjectId
  _creatorId: UserId
  _id: string
  action: string
  boundToObjectType: 'project'
  created: string
  creator: ExecutorOrCreator
  rawAction: string // deprecated
  rootId: ProjectId // project#:_projectId
  title: string
  updated: string
}

export type HomeActivitySchema = HomeActivityBase & HomeActivityType.Union

export type ApplicationHomeActivity = HomeActivityBase & HomeActivityType.Application
export type CollectionHomeActivity = HomeActivityBase & HomeActivityType.Collection
export type EntryHomeActivity = HomeActivityBase & HomeActivityType.Entry
export type EventHomeActivity = HomeActivityBase & HomeActivityType.Event
export type InviteHomeActivity = HomeActivityBase & HomeActivityType.Invite
export type OrganizationHomeActivity = HomeActivityBase & HomeActivityType.Organization
export type PostHomeActivity = HomeActivityBase & HomeActivityType.Post
export type ProjectHomeActivity = HomeActivityBase & HomeActivityType.Project
export type TagHomeActivity = HomeActivityBase & HomeActivityType.Tag
export type TaskHomeActivity = HomeActivityBase & HomeActivityType.Task
export type TasklistHomeActivity = HomeActivityBase & HomeActivityType.Tasklist
export type TeamHomeActivity = HomeActivityBase & HomeActivityType.Team
export type UserHomeActivity = HomeActivityBase & HomeActivityType.User
export type WorkHomeActivity = HomeActivityBase & HomeActivityType.Work
export type WorksHomeActivity = HomeActivityBase & HomeActivityType.Works

const schema: SchemaDef<HomeActivitySchema> = {
  _boundToObjectId: { type: RDBType.STRING },
  _creatorId: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  action: { type: RDBType.STRING },
  boundToObjectType: { type: RDBType.STRING },
  content: { type: RDBType.OBJECT },
  created: { type: RDBType.DATE_TIME },
  creator: { type: RDBType.OBJECT },
  rawAction: { type: RDBType.STRING },
  rootId: { type: RDBType.STRING },
  title: { type: RDBType.STRING },
  type: { type: RDBType.STRING },
  updated: { type: RDBType.DATE_TIME }
}

schemaColl.add({ schema, name: 'HomeActivity' })
