import { output, capitalize, emptyLine } from '../utils'
import { IDescription } from '../interface/IDescription'
import { AssocationDescription } from './AssocationDescription'

export class Schema {
  private currentPath: string
  private hasAssocDesc: boolean = false

  static async synchronize(filename: string, content: string) {
    await output(filename, content)
  }

  static banner = [
    `import { $_imports_$ } from 'ReactiveDB'`,
    `import { schemas } from '../SDK'`,
  ].join('\r\n')

  static declaration = `const schema: SchemaDef<any>`

  constructor(
    private schemaName: string,
    private content: Map<string, IDescription>,
    private ext: string = '.ts'
  ) { }

  filename() {
    return this.schemaName + this.ext
  }

  async synchronize() {
    if (!this.content.size) {
      throw new Error('Content is empty.')
    }

    this.currentPath = await output(capitalize(this.schemaName) + this.ext, this.stringify())
  }

  stringify(): string {
    const ret: string[] = []

    this.content.forEach((value) => {
      ret.push(value.stringify(2))
      if (value instanceof AssocationDescription) {
        this.hasAssocDesc =  this.hasAssocDesc || true
      }
    })

    return this.template(ret.join(',\r\n'))
  }

  template(payload: string): string {
    const imports = [
      'RDBType',
      'SchemaDef'
    ]

    if (this.hasAssocDesc) {
      imports.push('Association')
    }

    const rdbDeps = Schema.banner.replace('$_imports_$', imports.join(', '))

    return [
      rdbDeps,
      emptyLine,
      Schema.declaration + ' = {',
      payload,
      '}',
      emptyLine,
      `schemas.push({ schema, name: '${ this.schemaName }' })`,
      emptyLine
    ].join('\r\n')
  }
}
