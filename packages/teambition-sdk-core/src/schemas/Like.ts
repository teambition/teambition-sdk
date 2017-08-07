import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
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

schemas.push({ name: 'Like', schema })
