import { TagData } from '../../src/schemas/Tag'

export const tagsOrg: TagData[] = [
  {
    _id: '5ae1b961e9dd170012008328',
    name: '企业标签',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    updated: '2018-04-26T11:34:57.747Z',
    created: '2018-04-26T11:34:57.889Z',
    isArchived: null,
    color: 'blue',
    tagcategoryIds: [],
    tagcategories: []
  },
  {
    _id: '5ae1b976e9dd170012008337',
    name: '企业标签（被分类）',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    updated: '2018-04-26T11:35:26.886Z',
    created: '2018-04-26T11:35:18.626Z',
    isArchived: null,
    color: 'purple',
    tagcategoryIds: ['5ae1b968e9dd170012008331'],
    tagcategories: [
      {
        _id: '5ae1b968e9dd170012008331',
        name: '标签分类'
      }
    ]
  }
]
