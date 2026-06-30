import { locationKeyList } from '../constants/parser'

interface SerializeAstOptions {
  hideEmptyKeys: boolean
  hideKeys: string[]
  hideLocationData: boolean
  parserHideKeys: (number | string)[]
}

export function serializeAst(ast: unknown, options: SerializeAstOptions) {
  const seen = new WeakSet<object>()

  return JSON.stringify(
    ast,
    (key: string, value: unknown) => {
      if (options.hideEmptyKeys && value == null) {
        return
      }
      if (shouldSkipKey(key, options)) {
        return
      }
      if (typeof value === 'function') {
        return `function ${value.name}(...)`
      }
      if (typeof value === 'bigint') {
        return `(BigInt) ${value}n`
      }
      if (value instanceof RegExp) {
        return `(RegExp) ${value}`
      }
      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return `(circular: ${key || '#root'})`
        }
        seen.add(value)
      }

      return value
    },
    2,
  )
}

function shouldSkipKey(key: string, options: SerializeAstOptions) {
  return [
    ...(options.hideLocationData ? locationKeyList : []),
    ...options.hideKeys.filter(Boolean),
    ...options.parserHideKeys,
  ].includes(key)
}
