import { eslintParseResultHideKeys } from '~/constants/parser'
import { javascriptTemplate } from '~/constants/templates'
import type * as BabelParser from '@babel/parser'
import type * as TypeScriptESLintParser from '@typescript-eslint/parser'
import type * as Espree from 'espree'
import type * as ESprima from 'esprima'

export const esprima = defineParser<typeof ESprima, any>({
  id: 'esprima',
  label: 'esprima',
  icon: '',
  link: 'https://github.com/jquery/esprima',
  editorLanguage: 'javascript',
  pkgName: 'esprima',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {
      loc: true,
      range: true,
    },
    defaultValueType: 'json5',
  },
  version: fetchVersion,
  init: pkg => importSkypack(pkg),
  parse(code, options) {
    return this.parseModule(code, options)
  },
})

export const espree = defineParser<typeof Espree, Espree.Options>({
  id: 'espree',
  label: 'espree',
  icon: '',
  link: 'https://github.com/eslint/espree',
  editorLanguage: 'javascript',
  pkgName: 'espree',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      loc: true,
      range: true,
      tokens: true,
      comment: true,
    },
    defaultValueType: 'json5',
  },
  version: fetchVersion,
  init: pkg => importSkypack(pkg),
  parse(code, options) {
    return this.parse(code, options)
  },
})

export const babelParser = defineParser<
  typeof BabelParser,
  BabelParser.ParserOptions
>({
  id: 'babel-parser',
  label: '@babel/parser',
  icon: '',
  link: 'https://babeljs.io/docs/babel-parser',
  editorLanguage(options) {
    const plugins = Array.isArray(options?.plugins) ? options.plugins : []
    const normalizedPlugins = plugins.map(plugin =>
      Array.isArray(plugin) ? plugin[0] : plugin,
    )
    return normalizedPlugins.includes('typescript')
      ? 'typescript'
      : 'javascript'
  },
  getNodeLocation: genGetNodeLocation('startEnd'),
  pkgName: '@babel/parser',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {
      sourceType: 'module',
      plugins: ['jsx'],
      ranges: true,
    },
    defaultValueType: 'json5',
  },
  version: fetchVersion,
  init: pkg => importSkypack(pkg),
  parse(code, options) {
    return this.parse(code, options)
  },
})

export const typescriptESLint = defineParser<
  typeof TypeScriptESLintParser,
  TypeScriptESLintParser.ParserOptions
>({
  id: 'typescript-eslint-parser',
  label: '@typescript-eslint/parser',
  icon: '',
  link: 'https://typescript-eslint.io/packages/parser/',
  editorLanguage: 'typescript',
  pkgName: '@typescript-eslint/parser',
  options: {
    configurable: true,
    editorLanguage: 'json',
    defaultValue: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      loc: true,
      range: true,
      tokens: true,
      comment: true,
    },
    defaultValueType: 'json5',
  },
  versionOverridable: false,
  hideKeys: eslintParseResultHideKeys,
  async version() {
    return (await this).meta.version
  },
  init: () => import('#build/ts-eslint-parser'),
  parse(code, options) {
    return this.parseForESLint(code, options)
  },
})

export const javascript = defineLanguage({
  label: 'JavaScript',
  parsers: [esprima, espree, babelParser, typescriptESLint],
  codeTemplate: javascriptTemplate,
})
