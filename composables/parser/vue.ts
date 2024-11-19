import { vueTemplate } from '~/constants/templates'

export const vue = defineLanguage({
  label: 'Vue',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-vue',
  parsers: [],
  codeTemplate: vueTemplate,
})
