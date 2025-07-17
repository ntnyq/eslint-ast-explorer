import type { Language, Parser } from '~/types'

export function defineLanguage(language: Language) {
  return language
}

export function defineParser<C = unknown, O = unknown>(parser: Parser<C, O>) {
  return parser
}
