import { tomlTemplate } from '~/constants/templates'
import type * as TomlESLint from 'toml-eslint-parser'
import type { TomlESLintParseOptions } from '~/types'

export const tomlESLint = defineParser<
  typeof TomlESLint,
  TomlESLintParseOptions
>({
  id: 'toml-eslint-parser',
  label: 'toml-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/toml-eslint-parser',
  editorLanguage: 'json',
  pkgName: 'toml-eslint-parser',
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

export const toml = defineLanguage({
  label: 'TOML',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-light-toml',
  parsers: [
    //
    tomlESLint,
  ],
  codeTemplate: tomlTemplate,
})
