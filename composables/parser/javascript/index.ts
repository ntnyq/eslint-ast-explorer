import { javascriptTemplate } from '~/constants/templates'
import type * as ESprima from 'esprima'

export const esprima = defineParser<typeof ESprima, any>({
  id: 'esprima',
  label: 'esprima',
  icon: '',
  link: 'https://github.com/jquery/esprima',
  editorLanguage: 'javascript',
  pkgName: 'esprima',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {},
    defaultValueType: 'json5',
  },
  version: fetchVersion,
  init: pkg => importSkypack(pkg),
  parse(code, options) {
    return this.parseModule(code, options)
  },
})

export const javascript = defineLanguage({
  label: 'JavaScript',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [
    //
    esprima,
  ],
  codeTemplate: javascriptTemplate,
})
