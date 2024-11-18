import { tomlTemplate } from '~/constants/templates'

export const toml = defineLanguage({
  label: 'TOML',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [],
  codeTemplate: tomlTemplate,
})
