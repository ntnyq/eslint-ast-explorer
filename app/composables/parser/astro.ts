import * as espree from 'espree'
import { eslintParseResultHideKeys } from '~/constants/parser'
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
  editorLanguage: 'astro',
  pkgName: 'astro-eslint-parser',
  hideKeys: eslintParseResultHideKeys,
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {},
    defaultValueType: 'json5',
  },
  async version() {
    return (await this).meta.version!
  },
  init: () => import('#build/astro-eslint-parser'),
  parse(code, options) {
    return this.parseForESLint(code, {
      ...options,
      parser: options.parser ?? espree,
    })
  },
})

export const astro = defineLanguage({
  label: 'Astro',
  parsers: [
    //
    astroESLint,
  ],
  codeTemplate: astroTemplate,
})
