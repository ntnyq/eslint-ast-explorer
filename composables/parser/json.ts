import { jsonTemplate } from '~/constants/templates'

export const json = defineLanguage({
  label: 'Json',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [],
  codeTemplate: jsonTemplate,
})
