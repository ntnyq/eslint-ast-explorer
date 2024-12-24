import type { Parser } from './parser'

export interface Language {
  codeTemplate: string
  icon: string
  label: string
  parsers: Parser<any, any>[]
}
