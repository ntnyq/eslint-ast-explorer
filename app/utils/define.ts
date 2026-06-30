import { getNodeLocation } from '~/composables/location'
import type { Language, Parser } from '~/types'

export function defineLanguage(language: Language) {
  return language
}

export function defineParser<C = unknown, O = unknown>(parser: Parser<C, O>) {
  const { hideKeys = [], ...rest } = parser

  return {
    getNodeLocation,
    ...rest,
    hideKeys: Array.from(new Set(['parent', ...hideKeys])),
  }
}
