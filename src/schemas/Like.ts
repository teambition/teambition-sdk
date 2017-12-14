import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { ExecutorOrCreator } from 'teambition-types'

export interface LikeSchema {
  _id: string
  isLike: boolean
  likesCount: number
  likesGroup: ExecutorOrCreator[]
}

const schema: SchemaDef<LikeSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  isLike: {
    type: RDBType.BOOLEAN
  },
  likesCount: {
    type: RDBType.NUMBER
  },
  likesGroup: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ name: 'Like', schema })
