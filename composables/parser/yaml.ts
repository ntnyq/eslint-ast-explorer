import { yamlTemplate } from '~/constants/templates'
import { importSkypack } from '~/utils/parser'
import type * as YamlESLint from 'yaml-eslint-parser'
import type { YamlESLintParseOptions } from '~/types'

export const yamlESLint = defineParser<typeof YamlESLint, YamlESLintParseOptions>({
  id: 'yaml-eslint-parser',
  label: 'yaml-eslint-parser',
  icon: '',
  link: 'https://github.com/ota-meshi/yaml-eslint-parser',
  editorLanguage: 'yaml',
  pkgName: 'yaml-eslint-parser',
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

export const yaml = defineLanguage({
  label: 'YAML',
  // @unocss-include
  icon: 'i-vscode-icons:file-type-light-yaml',
  parsers: [yamlESLint],
  codeTemplate: yamlTemplate,
})
