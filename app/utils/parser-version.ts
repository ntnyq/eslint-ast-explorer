import validRange from 'semver/ranges/valid.js'
import { isUrl } from './url'

export const INVALID_PARSER_VERSION =
  'Invalid parser version. Use a semver version/range (up to 256 characters) or an npm dist-tag (up to 64 characters). Paths, query strings and fragments are not allowed.'

interface ValidatedParserVersion {
  value?: string
  error?: string
  url?: boolean
}

export function validateParserVersion(
  input: unknown,
  allowUrl = false,
): ValidatedParserVersion {
  if (input === undefined || input === '') {
    return {}
  }
  if (typeof input !== 'string') {
    return { error: INVALID_PARSER_VERSION }
  }
  const value = input.trim()
  if (isUrl(value)) {
    if (!allowUrl) {
      return { error: 'Remote parser URLs must be applied manually' }
    }
    try {
      const url = new URL(value)
      if (
        input.length <= 2048 &&
        !input.includes('\\') &&
        [...input].every(character => {
          const point = character.codePointAt(0) ?? 0
          return point > 32 && point !== 127
        }) &&
        url.hostname &&
        !url.username &&
        !url.password
      ) {
        return { value, url: true }
      }
    } catch {}
    return { error: 'Invalid parser URL. Use an explicit HTTP or HTTPS URL.' }
  }
  // Reject URL syntax before semver parsing, including encoded separators.
  if (
    input.length > 256 ||
    /[^\w .+*~^<>=|-]/.test(input) ||
    value.includes('..')
  ) {
    return { error: INVALID_PARSER_VERSION }
  }
  if (!value) {
    return {}
  }
  if (validRange(value) !== null || /^[a-z][\w.-]{0,63}$/i.test(value)) {
    return { value, url: false }
  }
  return { error: INVALID_PARSER_VERSION }
}
