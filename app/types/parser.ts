import type { AsyncComponentLoader } from 'vue'

export interface Parser<C = unknown, O = unknown> {
  editorLanguage: MonacoLanguage | ((options: O) => MonacoLanguage)

  icon: string

  id: string

  label: string

  link: string

  pkgName: string

  gui?: AsyncComponentLoader

  versionOverridable?: boolean

  parse: (this: C, code: string, options: O) => unknown

  init?: (pkgId: string) => C | Promise<C>

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

  version:
    | string
    | ((this: C | Promise<C>, pkgName: string) => string | Promise<string>)
}
