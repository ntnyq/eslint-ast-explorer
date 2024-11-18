import type { AsyncComponentLoader } from 'vue'

export interface Parser<C = unknown, O = unknown> {
  id: string

  label: string

  icon: string

  link: string

  pkgName: string

  version: string | ((this: C | Promise<C>, pkgName: string) => string | Promise<string>)

  versionOverridable?: boolean

  init?: (pkgId: string) => C | Promise<C>

  parse: (this: C, code: string, options: O) => unknown

  options: {
    configurable: boolean
    editorLanguage: MonacoLanguage
  } & (
    | {
        defaultValue: string
        defaultValueType?: 'javascript'
      }
    | {
        defaultValue: O
        defaultValueType?: 'json5'
      }
  )

  editorLanguage: MonacoLanguage | ((options: O) => MonacoLanguage)

  gui?: AsyncComponentLoader
}
