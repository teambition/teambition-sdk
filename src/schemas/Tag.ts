'use strict'
import { Schema, ISchema, schemaName, bloodyParent, child } from './schema'
import { TagId, UserId, OrganizationId, TagCategoryId, ProjectId } from '../teambition'
import { TagCategoryData } from './TagCategory'

export interface TagData extends ISchema {
  _creatorId: UserId
  _id: TagId
  _organizationId?: OrganizationId
  _projectId?: ProjectId
  color: string
  created: string
  isArchived: boolean
  name: string
  tagcategories: TagCategoryData[]
  tagcategoryIds: TagCategoryId[]
  updated: string
}

@schemaName('Tag')
export default class TagSchema extends Schema<TagData> implements TagData {
  @bloodyParent('Organization') _organizationId?: OrganizationId
  @bloodyParent('Project') _projectId?: ProjectId
  @child('Array', 'TagCategory') tagcategories: TagCategoryData[] = undefined
  _creatorId: UserId = undefined
  _id: TagId = undefined
  color: string = undefined
  created: string = undefined
  isArchived: boolean = undefined
  name: string = undefined
  tagcategoryIds: TagCategoryId[] = undefined
  updated: string = undefined
}
