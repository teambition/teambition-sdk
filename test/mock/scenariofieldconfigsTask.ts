import { TaskScenarioFieldConfigData } from '../../src/schemas/TaskScenarioFieldConfig'

export const scenarioFieldConfigsTask: TaskScenarioFieldConfigData[] = [
  {
    _id: '5add93997038dd1b7a133312',
    name: '任务',
    _creatorId: '569ee653f87e2d3e6ece85b8',
    objectType: 'task',
    _projectId: '5add9399ec560d0012893747',
    _taskflowId: null,
    icon: 'task',
    proTemplateConfigType: null,
    scenariofields: [
      {
        fieldType: 'note',
        _id: '5ae0c912fb06a00012fa0967',
        required: false,
        displayed: true,
        _roleIds: []
      },
      {
        fieldType: 'customfield',
        _customfieldId: '5ae0c8f8fb06a00012fa095a',
        _id: '5ae0c912fb06a00012fa0966',
        required: false,
        displayed: false,
        _roleIds: []
      },
      {
        fieldType: 'priority',
        _id: '5ae0c912fb06a00012fa0965',
        required: false,
        displayed: true,
        _roleIds: []
      },
      {
        fieldType: 'tag',
        _id: '5ae0c912fb06a00012fa0964',
        required: false,
        displayed: true,
        _roleIds: []
      }
    ],
    created: '2018-04-23T08:04:41.961Z',
    updated: '2018-04-25T18:29:38.600Z',
    isDefault: true,
    displayed: true
  }
]
