import type { Parser } from './parser'

export interface Language {
  label: string
  icon: string
  parsers: Parser<any, any>[]
  codeTemplate: string
}
