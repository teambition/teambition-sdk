import { fetch } from './fetch'
import { prompt } from './prompt'
import { createPairsDescription, attachAssocDescription, suffixOf, tryParseFixture } from './utils'
import { Schema } from './template'

const anchroId = global.encodeURI('返回')

export default async function() {
  const { schemaName } = await prompt([
    {
      type: 'input',
      message: 'Please input a name for new schema',
      name: 'schemaName',
    }
  ])

  const { url } = await prompt([
    {
      type: 'input',
      message: 'Please input doc url of target API',
      name: 'url',
      validate(payload) {
        const re = /docs\.teambition\.com\/*/
        if (!re.test(payload)) {
          return 'Sorry, you have to input a valid url which is start with \'docs.teambition.com\'.'
        }
        return true
      }
    }
  ])

  const page = await fetch(url)
  const fixture = page(`h3[id='${anchroId}']`).next().text()

  let apiPayload
  try {
    apiPayload = tryParseFixture(fixture)
  } catch (e) {
    const { editorData } = await prompt([{
      name: 'editorData',
      type: 'editor',
      message: 'Detecting an invalid JSON, Please paste it in editor manually.'
    }])

    apiPayload = tryParseFixture(editorData)
  }

  const { keptFields } = await prompt([{
      name: 'keptFields',
      type: 'checkbox',
      message: 'Please select the primitive fields that you want to save in schema',
      choices: Object.keys(apiPayload)
  }])

  const association: any[] = []

  let cursor = 0
  while (true) {
    cursor++
    const { cont } = await prompt([{
      name: 'cont',
      type: 'confirm',
      message: 'Do you want to attach association for your schema?',
      default: false
    }])

    if (!cont) {
      break
    }

    const { associationType } = await prompt([{
      name: 'associationType',
      type: 'list',
      message: `Here\'s the ${suffixOf(cursor)} property of association, Please select a relation.`,
      choices: [
        'oneToOne',
        'oneToMany',
        'manyToMany'
      ]
    }])

    const reSyntax = /(\w+)\s*=>\s*(\w+)\.(\w+)\s+as\s+(\w+)/
    const { sentence } = await prompt([{
      name: 'sentence',
      type: 'input',
      message: `Please specify the association and its navigator by the following format.\n  e.g. _creatorId => Member._id as creator`,
      validate(input) {
        if (!reSyntax.test(input)) {
          return 'Specified field does not exist in list which you want to save.'
        }
        return true
      }
    }])

    association.push({
      type: associationType,
      info: sentence.match(reSyntax).slice(1)
    })
  }

  const descriptionMap = createPairsDescription(apiPayload, keptFields)
  attachAssocDescription(descriptionMap, association)

  const schema = new Schema(schemaName, descriptionMap)
  await schema.synchronize()

  console.info(`Generated ${schema.filename()} successfully.`)
}
