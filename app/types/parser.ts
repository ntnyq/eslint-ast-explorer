import type { AsyncComponentLoader } from 'vue'
import type { LocRange } from '~/composables/location'

export interface Parser<C = unknown, O = unknown> {
  editorLanguage: MonacoLanguage | ((options: O) => MonacoLanguage)

  icon: string

  id: string

  label: string

  link: string

  pkgName: string

  gui?: AsyncComponentLoader

  hideKeys?: (number | string)[]

  versionOverridable?: boolean

  parse: (this: C, code: string, options: O) => unknown

  getNodeLocation?: (node: unknown, ast?: boolean) => LocRange | undefined

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

  nodeTitle?:
    | string
    | ((this: C | undefined, node: unknown) => string | undefined)
}
