declare module 'teambition' {
  interface Iapp {
    NAME: string
    VERSION: string
    LANGUAGE: string
    host: string
    apiHost: string
    strikerHost: string
    cdnHost: string
    wsHost: string
    wxid: string
    spiderhost: string
    dingApiHost: string
    socket: any
  }

  interface IUserEmail {
    email: string
    state: number
    _id: string
    id: string
  }

  interface IUserMe {
    _id: string
    email: string
    name: string
    avatarUrl: string
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
    aliens: any[]
    strikerAuth: string
    phoneForLogin: string
    enabledGoogleTwoFactor: boolean
    emails: IUserEmail[]
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

  interface IWxSignature {
    noncestr: string
    signature: string
    timestamp: number
  }

  interface IDingSignature {
    _organizationId: string
    agentId: string
    corpId: string
    nonceStr: string
    signature: string
    timeStamp: number
  }

  interface IGlobal {
    title: String
  }

  interface IProjectData {
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

  interface IMemberData {
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

  interface ILinkedData {
    _id: string
    _projectId: string
    _parentId: string
    _linkedId: string
    _creatorId: string
    updated: string
    created: string
    linkedType: string
    parentType: string
    creator: IMemberData
    title: string
    project: string
    isDone: boolean
    icon?: string
  }

  interface IEntryData {
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

  interface IEntryCategoriesData {
    _id: string
    _projectId: string
    title: string
    type: number
  }

  interface ITaskData {
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
    linked?: ILinkedData[]
    isLike?: boolean
    likedPeople?: string
    recurrenceTime?: string
    displayDuedate?: Date
    detailInfos?: IDetailInfos
    [index: string]: any
  }

  interface IFileData {
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
    creator: IMemberData
    tagIds: string[]
    visiable: string
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
    linked?: ILinkedData[]
    isLike?: boolean
    likedPeople?: string
    likesCount?: number
    [index: string]: any
  }

  interface ICollectionData {
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

  interface IPostData {
    _id: string
    postMode: string
    _creatorId: string
    _projectId: string
    involveMembers: string[]
    updated: string | number
    attachments: IFileData[]
    content: string
    html: string
    creator: IMemberData
    title: string
    displayContent?: string
    creatorName?: string
    creatorAvatar?: string
    fetchTime?: number
    linked?: ILinkedData[]
    isLike?: boolean
    likedPeople?: string
    likesCount?: number
    displayedTitle?: string
    [index: string]: any
  }

  interface IEventData {
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
    linked?: ILinkedData[]
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

  interface ILikeData {
    isLike: boolean
    likesCount: number
    likesGroup: IMemberData[]
  }

  interface ITagsData {
    _creatorId: string
    _id: string
    _projectId: string
    color: string
    created: string
    isArchived: boolean
    name: string
    updated: string
  }

  export interface IStageData {
    _id: string
    name: string
    _creatorId: string
    _tasklistId: string
    _projectId: string
    isArchived: boolean
    totalCount: number
    order: number
  }

  interface ITasklistData {
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
    hasStages: IStageData[]
  }

  interface IDetailInfos {
    like?: ILikeData
    tags?: ITagsData[]
    tasklist?: ITasklistData
    stage?: IStageData
    members?: {[index: string]: IMemberData}
  }

  interface IMessageData {
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
    project: IProjectData
    task: ITaskData | IEventData | IPostData | IEntryData | IFileData
    subtitle: string
    latestActivity: any
  }

  interface ITburlData {
    statusCode: number
    isExist: boolean
    code: string
    origin?: string
  }

  interface IProjectInviteData {
    projectId: string
    invitorId: string
    signCode: string
  }

  interface IActivityData {
    _id: string
    action: string
    rawAction: string
    created: number
    boundToObjectType: string
    creator: IMemberData
    title: string
    content?: {
      comment?: string
      attachments: IFileData[]
      mentionsArray: string[]
      mentions: IMemberData
      attachmentsName: string
      creator: string
        linked?: {
        _id: string
        _projectId: string
        _objectId: string
        objectType: string
        title: string
      }
    }
    isComment?: boolean
    icon?: string
    creatorName?: string
    creatorAvatar?: string
    comment?: string
    linked?: {
      _id?: string
    }
  }

  interface IActivitySaveData {
    _boundToObjectId: string
    attachments: string[]
    boundToObjectType: string
    content: string
  }

  interface IProjectActivitiesData {
    _id: string
    action: string
    content: {
      objects: any
      objectType: string
      creator: string
    }
    created: string
    boundToObjectType: string
    creator: IMemberData
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

  interface IEventsResult {
    data: {
      [index: string]: IEventData[]
    }
    raw: IEventData[]
    index: string[]
    counter: number
  }

  interface IStrikerRes {
    fileName: string
    fileSize: string
    fileType: string
    fileCategory: string
    fileKey: string
  }

  interface IOrganizationData {
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
      lastPaidTime: string
      firstPaidTime: string
      updated: string
      created: string
      expired: boolean
      free: boolean
      membersCount: number
      days: number
    }
    _defaultRoleId: number
    _roleId: number
  }

  interface ISubtaskData {
    _id: string
    _projectId: string
    _creatorId: string
    content: string
    isDone: boolean
    _executorId: string
    _taskId: string
    dueDate: string
    order: number
    exector: IMemberData
  }

}
