export function encodeUrlState(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCodePoint(byte)
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

export function decodeUrlState(value: string) {
  if (!value) {
    return ''
  }

  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  )
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, char => char.codePointAt(0) || 0)

  return new TextDecoder().decode(bytes)
}

export function isUrl(value: string) {
  return /^https?:\/\//.test(value)
}
