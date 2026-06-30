import type { LocRange } from '~/composables/location'

export interface AstTreeIndex {
  childContainsCursor: (value: unknown) => boolean
  containsCursor: (value: unknown) => boolean
  matchesSearch: (value: unknown, key?: string) => boolean
}

interface CreateAstTreeIndexOptions {
  cursor: number
  getRange: (value: unknown) => LocRange | undefined
  nodeTitleFor?: (value: unknown) => string | undefined
  root: unknown
  searchQuery: string
  shouldHideKey: (key: string | number, value: unknown) => boolean
}

interface VisitResult {
  childCursor: boolean
  selfCursor: boolean
  subtreeMatch: boolean
}

export function createAstTreeIndex({
  cursor,
  getRange,
  nodeTitleFor,
  root,
  searchQuery,
  shouldHideKey,
}: CreateAstTreeIndexOptions): AstTreeIndex {
  const selfCursorNodes = new WeakSet<object>()
  const childCursorNodes = new WeakSet<object>()
  const searchMatchNodes = new WeakSet<object>()
  const childResultCache = new WeakMap<
    object,
    Omit<VisitResult, 'selfCursor'>
  >()
  const normalizedSearch = searchQuery.trim().toLowerCase()

  visit(root)

  return {
    childContainsCursor: value =>
      isObject(value) && childCursorNodes.has(value),
    containsCursor: value => isObject(value) && selfCursorNodes.has(value),
    matchesSearch(value, key) {
      if (!normalizedSearch) {
        return true
      }
      if (isObject(value)) {
        return searchMatchNodes.has(value)
      }
      return nodeSelfMatches(value, key)
    },
  }

  function visit(
    value: unknown,
    key?: string | number,
    ancestors: unknown[] = [],
  ): VisitResult {
    const selfCursor = containsCursor(getRange(value), cursor)
    const selfMatch = nodeSelfMatches(value, key)

    if (!isObject(value) || ancestors.includes(value)) {
      return {
        childCursor: false,
        selfCursor,
        subtreeMatch: selfMatch,
      }
    }

    const childResult =
      childResultCache.get(value) || getChildResult(value, ancestors)
    const childCursor = childResult.childCursor
    const subtreeMatch = selfMatch || childResult.subtreeMatch

    if (selfCursor) {
      selfCursorNodes.add(value)
    }
    if (childCursor) {
      childCursorNodes.add(value)
    }
    if (subtreeMatch) {
      searchMatchNodes.add(value)
    }

    return {
      childCursor,
      selfCursor,
      subtreeMatch,
    }
  }

  function getChildResult(
    value: object,
    ancestors: unknown[],
  ): Omit<VisitResult, 'selfCursor'> {
    const childResults = getEntries(value)
      .filter(([childKey, childValue]) => !shouldHideKey(childKey, childValue))
      .map(([childKey, childValue]) =>
        visit(childValue, childKey, [...ancestors, value]),
      )

    const result = {
      childCursor: childResults.some(
        childResult => childResult.selfCursor || childResult.childCursor,
      ),
      subtreeMatch: childResults.some(childResult => childResult.subtreeMatch),
    }

    childResultCache.set(value, result)

    return result
  }

  function nodeSelfMatches(value: unknown, key?: string | number) {
    if (!normalizedSearch) {
      return true
    }

    const haystack = [
      key == null ? undefined : String(key),
      nodeTitleFor?.(value) || defaultNodeTitleFor(value),
      formatPrimitiveForAstTree(value),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  }
}

export function formatPrimitiveForAstTree(value: unknown) {
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return 'undefined'
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'bigint') {
    return `${value}n`
  }
  if (typeof value === 'function') {
    return `function ${value.name || 'anonymous'}(...)`
  }
  if (value instanceof RegExp) {
    return String(value)
  }
  return ''
}

function containsCursor(range: LocRange | undefined, cursor: number) {
  return !!range && range[0] <= cursor && range[1] >= cursor
}

function defaultNodeTitleFor(value: unknown) {
  if (!isObject(value)) {
    return
  }
  const title = (value as Record<string, unknown>).type
  return typeof title === 'string' ? title : undefined
}

function getEntries(value: object): [string | number, unknown][] {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => [index, childValue])
  }

  return Object.entries(value)
}

function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}
