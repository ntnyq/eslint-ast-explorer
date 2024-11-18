import { javascriptTemplate } from '~/constants/templates'

export const javascript = defineLanguage({
  label: 'JavaScript',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [],
  codeTemplate: javascriptTemplate,
})
