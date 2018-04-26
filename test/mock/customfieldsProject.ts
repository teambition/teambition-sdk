import { CustomFieldData } from '../../src/schemas/CustomField'

export const customfieldsProject: CustomFieldData[] = [
  {
    _id: '5acf042534d5b40012d2e3d2',
    name: '项目开始时间',
    type: 'date',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    description: '',
    _roleIds: [],
    displayed: false,
    pos: 5323423744,
    updated: '2018-04-12T07:00:53.334Z',
    created: '2018-04-12T07:00:53.334Z',
    choices: [],
    boundType: 'project'
  },
  {
    _id: '5acf042634d5b40012d2e3d3',
    name: '项目结束时间',
    type: 'date',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    description: '',
    _roleIds: [],
    displayed: false,
    pos: 5323489280,
    updated: '2018-04-12T07:00:54.429Z',
    created: '2018-04-12T07:00:54.429Z',
    choices: [],
    boundType: 'project'
  },
  {
    _id: '5acf042734d5b40012d2e3d4',
    name: '项目状态',
    type: 'dropDown',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    description: '',
    _roleIds: [],
    displayed: false,
    pos: 5323554816,
    updated: '2018-04-12T07:00:55.048Z',
    created: '2018-04-12T07:00:55.048Z',
    choices: [
      {
        value: '正在运行',
        _id: '5acf042734d5b40012d2e3d8'
      },
      {
        value: '已暂停',
        _id: '5acf042734d5b40012d2e3d7'
      },
      {
        value: '已取消',
        _id: '5acf042734d5b40012d2e3d6'
      },
      {
        value: '已完成',
        _id: '5acf042734d5b40012d2e3d5'
      }
    ],
    boundType: 'project'
  },
  {
    _id: '5ae0c863c9464500120cd695',
    name: '企业自定义字段',
    type: 'dropDown',
    _organizationId: '5acf0425d9bd1500017f5e03',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    description: '',
    _roleIds: [],
    displayed: false,
    pos: 5337776128,
    updated: '2018-04-25T18:26:43.636Z',
    created: '2018-04-25T18:26:43.636Z',
    choices: [
      {
        value: '选一',
        _id: '5ae0c863c9464500120cd697'
      },
      {
        value: '选二',
        _id: '5ae0c863c9464500120cd696'
      }
    ],
    boundType: 'project'
  }
]
