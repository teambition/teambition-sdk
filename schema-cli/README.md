teambition-sdk schema generator
===============================
A schema generator for SDK

## Quick start
* Setup
```
  npm i
```

* Run
```
  npm run start

  Please input a name for new schema [tag]
  Please input doc url of target API [http://docs.teambition.com/teambition/tags/get.html]
  Please select the primitive fields that you want to save in schema [_id, _projectId, name]
  Do you want to attach association for your schema [YES]
  Here's the 1st property of association, Please select a relation. [oneToOne]
  Please specify the association and its navigator by the following format.
  e.g. _creatorId => Member._id as creator [_projectId => Project._id as project]
  Do you want to attach association for your schema? [No]
```

you will get the Tag.ts in Folder: `output`

```
import { RDBType, SchemaDef, Association } from 'ReactiveDB'
import { schemas } from '../SDK'

const schema: SchemaDef<any> = {
  _id: {
    type : RDBType.STRING,
    primaryKey : true
  },
  _projectId: {
    type : RDBType.STRING
  },
  name: {
    type : RDBType.STRING
  },
  project: {
    type : Association.oneToOne,
    virtual : {
      name : 'Project',
      where : (ProjectTable) => ({
        _projectId: ProjectTable._id
      })
    }
  }
}

schemas.push({ schema, name: 'tag' })
```

### Have fun
