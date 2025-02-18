import { svelteTemplate } from '~/constants/templates'
import type * as SvelteESLint from 'svelte-eslint-parser'
import type { SvelteESLintParseOptions } from '~/types'

export const svelteESLint = defineParser<
  typeof SvelteESLint,
  SvelteESLintParseOptions
>({
  id: 'svelte-eslint-parser',
  label: 'svelte-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/svelte-eslint-parser',
  editorLanguage: 'svelte',
  pkgName: 'svelte-eslint-parser',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {},
    defaultValueType: 'json5',
  },
  async version() {
    return (await this).meta.version!
  },
  init: () => import('#build/svelte-eslint-parser'),
  parse(code, options) {
    return this.parseForESLint(code, options)
  },
})

export const svelte = defineLanguage({
  label: 'Svelte',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-svelte',
  parsers: [
    //
    svelteESLint,
  ],
  codeTemplate: svelteTemplate,
})
