import { astroTemplate } from '~/constants/templates'
import type * as AstroESLint from 'astro-eslint-parser'
import type { AstroESLintParseOptions } from '~/types'

export const astroESLint = defineParser<
  typeof AstroESLint,
  AstroESLintParseOptions
>({
  id: 'astro-eslint-parser',
  label: 'astro-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/astro-eslint-parser',
  editorLanguage: 'json',
  pkgName: 'astro-eslint-parser',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {},
    defaultValueType: 'json5',
  },
  async version() {
    return (await this).meta.version!
  },
  init: pkg => importSkypack(pkg),
  parse(code, options) {
    return this.parseForESLint(code, options)
  },
})

export const astro = defineLanguage({
  label: 'Astro',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-light-astro',
  parsers: [
    //
    astroESLint,
  ],
  codeTemplate: astroTemplate,
})
