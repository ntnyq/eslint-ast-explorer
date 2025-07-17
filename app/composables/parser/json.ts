import { jsonTemplate } from '~/constants/templates'
import type * as JsoncESLint from 'jsonc-eslint-parser'
import type { JsoncESLintParseOptions } from '~/types'

export const jsoncESLint = defineParser<
  typeof JsoncESLint,
  JsoncESLintParseOptions
>({
  id: 'jsonc-eslint-parser',
  label: 'jsonc-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/jsonc-eslint-parser',
  editorLanguage: 'json',
  pkgName: 'jsonc-eslint-parser',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {},
    defaultValueType: 'json5',
  },
  async version() {
    return (await this).meta.version!
  },
  init: () => import('#build/jsonc-eslint-parser'),
  parse(code, options) {
    return this.parseForESLint(code, options)
  },
})

export const json = defineLanguage({
  label: 'Json',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-json-official',
  parsers: [
    //
    jsoncESLint,
  ],
  codeTemplate: jsonTemplate,
})
