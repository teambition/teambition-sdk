export interface UserEmail {
  email: string
  state: number
  _id: string
  id: string
}

export interface UserMe {
  _id: string
  email: string
  name: string
  avatarUrl: string
  created: string
  title: string
  birthday: string
  location: string
  phone: string
  isActive: boolean
  website: string
  pinyin: string
  py: string
  isNew: boolean
  notification: {
    comment: {
      mobile: boolean
      email: boolean
    },
    newpost: {
      mobile: boolean
      email: boolean
    },
    newtask: {
      mobile: boolean
      email: boolean
    },
    newwork: {
      mobile: boolean
      email: boolean
    },
    newevent: {
      mobile: boolean
      email: boolean
    },
    involve: {
      mobile: boolean
      email: boolean
    },
    update: {
      mobile: boolean
      email: boolean
    },
    daily: {
      mobile: boolean
      email: boolean
    },
    monthly: {
      mobile: boolean
      email: boolean
    }
  }
  locationByIP: {
    country: string
    region: string
    city: string
  }
  aliens: any[]
  strikerAuth: string
  phoneForLogin: string
  enabledGoogleTwoFactor: boolean
  emails: UserEmail[]
  snapperToken: string
  hasNew: boolean
  badge: number
  inbox: number
  normal: number
  ated: number
  later: number
  private: number
  hasNormal: boolean
  hasAted: boolean
  hasLater: boolean
  hasPrivate: boolean
  calLink: string
  taskCalLink: string
  joinedProjectsCount: number
}

export interface ProjectData {
  _id: string
  name: string
  logo: string
  py: string
  isPublic: boolean
  created: string
  isStar: boolean
  starsCount: number
  canArchive: boolean
  canQuit: boolean
  canDelete: boolean
  deleted: boolean
  organization: {
    name: string
    description: string
    logo: string
    isPublic: boolean
    _id: string
    isExpired: boolean
  }
  signCode: string
  _rootCollectionId: string
  _defaultCollectionId: string
  organizationId?: string
  organizationName?: string
  _py?: number
  style?: string
  parsed: boolean
}

export interface MemberData {
  _id: string
  _boundToObjectId: string
  boundToObjectType: string
  invited: string
  visited: string
  unreadMessageCount: string
  name: string
  unreadCount: number
  pushStatus: boolean
  isQuited: boolean
  joined: string
  isAdmin: boolean
  isOwner: boolean
  hasRight: number
  location: string
  phone: string
  isActive: boolean
  email: string
  latestActived: string
  website: string
  birthday: string
  avatarUrl: string
  title: string
  pinyin: string
  py: string
  _memberId: string
  hasVisited: boolean
  _roleId: number
  type: string
  in: string
  hasOrgRight: number
}

export interface LinkedData {
  _id: string
  _projectId: string
  _parentId: string
  _linkedId: string
  _creatorId: string
  updated: string
  created: string
  linkedType: string
  parentType: string
  creator: MemberData
  title: string
  project: string
  isDone: boolean
  icon?: string
}

export interface EntryData {
  _id: string
  _projectId: string
  _creatorId: string
  _entryCategoryId: string
  content: string
  note: string
  amount: number
  status: string
  type: number
  date: string
  involveMembers: string[]
  tagIds: string[]
  visiable: string
  created: string
  isArchived: boolean
  isFavorite: boolean
  title?: string
}

export interface EntryCategoriesData {
  _id: string
  _projectId: string
  title: string
  type: number
}

export type visibility = 'project' | 'organization' | 'all'

export interface TaskData {
  _id: string
  _executorId: string
  _projectId: string
  _tasklistId: string
  tagsId: string[]
  _stageId: string
  involveMembers: string[]
  updated: string
  created: string
  isDone: boolean
  priority: number
  dueDate: string
  note: string
  content: string
  likesCount: number
  recurrence: string[] | string
  subtaskCount: {
    total: number
    done: number
  }
  executor: {
    name: string
    avatarUrl: string
    _id: string
  }
  oneDay?: boolean
  overDue?: boolean
  executorAvatar?: string
  executorName?: string
  parsedNote?: string
  stage?: string
  subtaskDone?: number
  subtaskTotal?: number
  tasklist?: string
  fetchTime?: number
  linked?: LinkedData[]
  isLike?: boolean
  likedPeople?: string
  recurrenceTime?: string
  displayDuedate?: Date
  [index: string]: any
}

export interface FileData {
  _id: string
  fileName: string
  fileType: string
  fileSize: number
  fileKey: string
  fileCategory: string
  imageWidth: number
  imageHeight: number
  _parentId: string
  _projectId: string
  _creatorId: string
  creator: MemberData
  tagIds: string[]
  visiable: visibility
  downloadUrl: string
  thumbnail: string
  thumbnailUrl: string
  description: string
  source: string
  folder: string
  involveMembers: string[]
  created: string
  updated: string | number
  lastVersionTime: string
  isArchived: boolean
  previewUrl: string
  class?: string
  creatorName?: string
  creatorAvatar?: string
  linked?: LinkedData[]
  isLike?: boolean
  likedPeople?: string
  likesCount?: number
  [index: string]: any
}

export interface CollectionData {
  _id: string
  _parentId: string
  collectionType: string
  _creatorId: string
  _projectId: string
  description: string
  title: string
  updated: string
  created: string
  isArchived: boolean
  workCount: number
  collectionCount: number
  color: string
  [index: string]: any
}

export interface PostData {
  _id: string
  postMode: string
  _creatorId: string
  _projectId: string
  involveMembers: string[]
  updated: string | number
  attachments: FileData[]
  content: string
  html: string
  creator: MemberData
  title: string
  displayContent?: string
  creatorName?: string
  creatorAvatar?: string
  fetchTime?: number
  linked?: LinkedData[]
  isLike?: boolean
  likedPeople?: string
  likesCount?: number
  displayedTitle?: string
  [index: string]: any
}

export interface EventData {
  _id: string
  endDate: any
  startDate: any
  _projectId: string
  location: string
  content: string
  title: string
  recurrence: string
  updated: string
  involveMembers: string[]
  linked?: LinkedData[]
  contentToDisplay?: string
  eventTime1?: string
  eventTime2?: string
  recurrenceTime?: string
  fetchTime?: number
  isLike?: boolean
  likedPeople?: string
  likesCount?: number
  [index: string]: any
}

export interface LikeData {
  isLike: boolean
  likesCount: number
  likesGroup: MemberData[]
}

export interface TagsData {
  _creatorId: string
  _id: string
  _projectId: string
  color: string
  created: string
  isArchived: boolean
  name: string
  updated: string
}

export interface StageData {
  _id: string
  name: string
  _creatorId: string
  _tasklistId: string
  _projectId: string
  isArchived: boolean
  totalCount: number
  order: number
}

export interface TasklistData {
  _id: string
  title: string
  description: string
  _projectId: string
  _creatorId: string
  isArchived: boolean
  stageIds: string[]
  updated: string
  created: string
  totalCount: number
  doneCount: number
  undoneCount: number
  expiredCount: number
  recentCount: number
  hasStages: StageData[]
}

export interface MessageData {
  _id: string
  _boundToObjectId: string
  _userId: string
  boundToObjectType: string
  __v: number
  isAted: boolean
  isLater: boolean
  unreadActivitiesCount: number
  isRead: boolean
  isArchived: boolean
  updated: string
  created: string
  creator: {
    _id: string
    avatarUrl: string
    name: string
    isStaff: boolean
    isDefaultEmail: boolean
    id: string
  }
  _projectId: string
  project: ProjectData
  task: TaskData | EventData | PostData | EntryData | FileData
  subtitle: string
  latestActivity: any
}

export interface TburlData {
  statusCode: number
  isExist: boolean
  code: string
  origin?: string
}

export interface ProjectInviteData {
  projectId: string
  invitorId: string
  signCode: string
}

export interface ProjectActivitiesData {
  _id: string
  action: string
  content: {
    objects: any
    objectType: string
    creator: string
  }
  created: string
  boundToObjectType: string
  creator: MemberData
  title: string
  creatorId?: string
  creatorName?: string
  avatarUrl?: string
  icon?: string
  files?: any[]
  type?: string
  postTitle?: string
  objectHref?: string
  isDone?: boolean
  objectContent?: string
}

export interface StrikerRes {
  fileName: string
  fileSize: string
  fileType: string
  fileCategory: string
  fileKey: string
}

export interface OrganizationData {
  _id: string
  name: string
  _creatorId: string
  logo: string
  description: string
  category: string
  pinyin: string
  py: string
  isPublic: boolean
  dividers: {
    name: string
    pos: number
  }[]
  projectIds: string[]
  created: string
  background: string
  plan: {
    lastPaidTime?: string
    firstPaidTime?: string
    updated?: string
    created?: string
    expired: string
    free?: boolean
    membersCount: number
    days: number
  }
  _defaultRoleId: string
  _roleId: number
}

export interface SubtaskData {
  _id: string
  _projectId: string
  _creatorId: string
  content: string
  isDone: boolean
  _executorId: string
  _taskId: string
  dueDate: string
  order: number
  exector: MemberData
}

export interface HomeActivity {
  _id: string
  _creatorId: string
  action: string
  content: {
    objects: any[],
    objectType: 'post' | 'task' | 'event' | 'work',
    creator: string
  },
  rootId: string,
  created: string
  _boundToObjectId: string,
  boundToObjectType: 'post' | 'task' | 'event' | 'work'
  rawAction: string
  creator: Executor
  title: string
  likes: LikeData[]
  isLike: boolean
}

export interface Executor {
  name: string
  avatarUrl: string
  _id: string
}

export interface InviteLinkData {
  inviteLink: string
  mobileInviteLink: string
  signCode: string
  created: string
  expiration: string
}

export interface CreatedInProject {
  work: number
  post: number
  event: number
  task: number
}

export interface RecommendMember {
  _id: string
  email: string
  avatarUrl: string
  name: string
  latestActived: string
  isActive: boolean
  website: string
  title: string
  location: string
}

export interface ProjectStatistic {
  task: {
    total: number
    done: number
    today: number
  }
  recent: number[]
  days: number[][]
}
