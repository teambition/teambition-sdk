export interface CustomFieldCascadingChoiceSchema {
  value: string
  choices?: CustomFieldCascadingChoiceSchema[]
}

export interface CustomFieldCascadingPayloadSchema {
  choices: CustomFieldCascadingChoiceSchema[]
  mustSelectLeaf: boolean
}
