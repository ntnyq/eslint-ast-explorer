import type { AsyncComponentLoader } from 'vue'

export interface Parser<C = unknown, O = unknown> {
  id: string

  label: string

  icon: string

  link: string

  pkgName: string

  version: ((this: C | Promise<C>, pkgName: string) => Promise<string> | string) | string

  versionOverridable?: boolean

  init?: (pkgId: string) => C | Promise<C>

  parse: (this: C, code: string, options: O) => unknown

  options: {
    configurable: boolean
    editorLanguage: MonacoLanguage
  } & (
    | {
        defaultValue: O
        defaultValueType?: 'json5'
      }
    | {
        defaultValue: string
        defaultValueType?: 'javascript'
      }
  )

  editorLanguage: ((options: O) => MonacoLanguage) | MonacoLanguage

  gui?: AsyncComponentLoader
}
