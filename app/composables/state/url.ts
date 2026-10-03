import {
  createPersistedUrlState,
  createShareableUrlState,
  normalizeRestoredUrlState,
} from '~/utils/url-state'
import type { SerializedAppState } from '~/utils/url-state'

const LAST_STATE_KEY = 'eslint-ast-explorer:last-state'
const HISTORY_STATE_KEY = 'eslintAstExplorer'
let urlStateInitialized = false

export function initUrlState() {
  if (urlStateInitialized) {
    return
  }
  urlStateInitialized = true
  let restoringNavigation = false
  let previousSelection = ''

  function restore(input: SerializedAppState | undefined) {
    const state = normalizeRestoredUrlState(input)
    currentLanguageId.value =
      state?.l && Object.hasOwn(LANGUAGES, state.l)
        ? (state.l as Language)
        : 'yaml'
    const parsers = currentLanguage.value.parsers
    setParserId(
      parsers.find(parser => parser.id === state?.p)?.id || parsers[0]!.id,
    )
    restoreOverrideVersion(typeof state?.v === 'string' ? state.v : undefined)
    setDefaultOptions()
    if (typeof state?.o === 'string' && state.o) {
      rawOptions.value = state.o
    }
    code.value =
      typeof state?.c === 'string' && state.c
        ? state.c
        : currentLanguage.value.codeTemplate
    previousSelection = selectionKey({
      l: currentLanguageId.value,
      p: currentParser.value.id,
      v: overrideVersion.value,
    })
  }

  const hashState = parseStateFromHash()
  const storedState = readStoredState()
  // Refresh preserves local edits; a shared URL for another selection uses its own sample.
  restore(
    hashState
      ? selectionKey(hashState) === selectionKey(storedState)
        ? { ...storedState, ...hashState }
        : hashState
      : storedState,
  )

  function restoreNavigation() {
    const hash = parseStateFromHash()
    const saved = parseState(window.history.state?.[HISTORY_STATE_KEY])
    restoringNavigation = true
    restore(selectionKey(saved) === selectionKey(hash) ? saved || hash : hash)
    nextTick(() => {
      restoringNavigation = false
    })
  }
  useEventListener(window, 'popstate', restoreNavigation)
  useEventListener(window, 'hashchange', restoreNavigation)

  watchEffect(() => {
    const state = {
      l: currentLanguageId.value,
      p: currentParser.value.id,
      c: code.value === currentLanguage.value.codeTemplate ? '' : code.value,
      o: rawOptions.value,
      v: overrideVersion.value,
    } satisfies SerializedAppState
    const shareableState = createShareableUrlState(state)
    const persistedState = createPersistedUrlState(state)
    const selection = selectionKey(state)
    if (!restoringNavigation) {
      try {
        const method =
          selection === previousSelection ? 'replaceState' : 'pushState'
        window.history[method](
          { ...window.history.state, [HISTORY_STATE_KEY]: persistedState },
          '',
          shareableState
            ? `#${encodeUrlState(shareableState)}`
            : `${window.location.pathname}${window.location.search}`,
        )
        previousSelection = selection
      } catch (err) {
        console.error('Failed to write URL state', err)
      }
    }
    try {
      if (persistedState) {
        window.localStorage.setItem(LAST_STATE_KEY, persistedState)
      } else {
        window.localStorage.removeItem(LAST_STATE_KEY)
      }
    } catch (err) {
      console.error('Failed to persist app state', err)
    }
  })
}

function selectionKey(state: SerializedAppState | undefined) {
  return JSON.stringify([state?.l, state?.p, state?.v || undefined])
}

function parseState(serialized: unknown): SerializedAppState | undefined {
  if (typeof serialized !== 'string') {
    return
  }
  try {
    const state: unknown = JSON.parse(serialized)
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      const parsed: SerializedAppState = {}
      for (const key of ['l', 'p', 'c', 'o', 'v'] as const) {
        const value = (state as Record<string, unknown>)[key]
        if (typeof value === 'string') {
          parsed[key] = value
        }
      }
      return parsed
    }
  } catch {}
}

function readStoredState() {
  try {
    return parseState(window.localStorage.getItem(LAST_STATE_KEY))
  } catch {}
}

function parseStateFromHash() {
  try {
    return parseState(decodeUrlState(window.location.hash.slice(1)))
  } catch {}
}
