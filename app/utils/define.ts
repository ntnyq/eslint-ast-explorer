import { getNodeLocation } from '~/composables/location'
import type { Language, Parser } from '~/types'

export function defineLanguage(language: Language) {
  return language
}

export function defineParser<C = unknown, O = unknown>(parser: Parser<C, O>) {
  return {
    getNodeLocation,
    hideKeys: ['parent'],
    ...parser,
  }
}
