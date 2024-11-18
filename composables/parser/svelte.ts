import { svelteTemplate } from '~/constants/templates'

export const svelte = defineLanguage({
  label: 'Svelte',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [],
  codeTemplate: svelteTemplate,
})
