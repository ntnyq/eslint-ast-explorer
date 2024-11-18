import { astroTemplate } from '~/constants/templates'

export const astro = defineLanguage({
  label: 'Astro',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-js-official',
  parsers: [],
  codeTemplate: astroTemplate,
})
