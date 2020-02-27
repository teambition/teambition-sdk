import { SchemaDef, RDBType } from '../db'
import { ProjectRoleId, ProjectId, CustomRoleId } from 'teambition-types'
import { CustomRoleSchema } from './CustomRole'
import { schemaColl } from './schemas'

export interface ProjectRoleSchema {
  _id: ProjectRoleId
  name: string
  _projectId: ProjectId
  _roleId: CustomRoleId
  level: number
  created: string
  isDefault: boolean // 是否是系统自带角色
  isDefaultRole: boolean // 是否是项目默认角色
  role: CustomRoleSchema<'project'>
}

const schema: SchemaDef<ProjectRoleSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  name: {
    type: RDBType.STRING
  },
  level: {
    type: RDBType.NUMBER
  },
  _projectId: {
    type: RDBType.STRING
  },
  _roleId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  isDefault: {
    type: RDBType.BOOLEAN
  },
  isDefaultRole: {
    type: RDBType.BOOLEAN
  },
  role: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ schema, name: 'ProjectRole' })
