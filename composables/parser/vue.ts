import { vueTemplate } from '~/constants/templates'
import { importSkypack } from '~/utils/parser'
import type * as VueESLint from 'vue-eslint-parser'
import type { VueESLintParseOptions } from '~/types'

export const vueESLint = defineParser<typeof VueESLint, VueESLintParseOptions>({
  id: 'vue-eslint-parser',
  label: 'vue-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/vue-eslint-parser',
  editorLanguage: 'yaml',
  pkgName: 'vue-eslint-parser',
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

export const vue = defineLanguage({
  label: 'Vue',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-vue',
  parsers: [
    //
    vueESLint,
  ],
  codeTemplate: vueTemplate,
})
