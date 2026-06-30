import {
  createPersistedUrlState,
  createShareableUrlState,
  normalizeRestoredUrlState,
} from '~/utils/url-state'
import type { SerializedAppState } from '~/utils/url-state'

const PREFIX = 'eslint-ast-explorer:'
const LAST_STATE_KEY = `${PREFIX}last-state`

let urlStateInitialized = false

export function initUrlState() {
  if (urlStateInitialized) {
    return
  }
  urlStateInitialized = true

  const state = normalizeRestoredUrlState(readInitialState())

  if (state?.l && state.l in LANGUAGES) {
    currentLanguageId.value = state.l as Language
  }
  if (state?.p) {
    currentParserId.value = state.p
  }
  if (state?.v) {
    restoreOverrideVersion(state.v)
  }
  if (state?.o) {
    rawOptions.value = state.o
  }
  code.value =
    state?.c === undefined || state.c === ''
      ? currentLanguage.value.codeTemplate
      : state.c

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

    try {
      window.history.replaceState(
        null,
        '',
        shareableState
          ? `#${encodeUrlState(shareableState)}`
          : `${window.location.pathname}${window.location.search}`,
      )
    } catch (err) {
      console.error('Failed to write URL state', err)
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

function readInitialState() {
  const hashState = parseStateFromHash()
  if (hashState) {
    return hashState
  }

  let serialized: string | null = null
  try {
    serialized = window.localStorage.getItem(LAST_STATE_KEY)
  } catch (err) {
    console.error('Failed to read app state', err)
  }
  if (!serialized) {
    return
  }

  try {
    return JSON.parse(serialized) as SerializedAppState
  } catch {}
}

function parseStateFromHash() {
  const hash = window.location.hash.slice(1)
  if (!hash) {
    return
  }

  try {
    return JSON.parse(decodeUrlState(hash)) as SerializedAppState
  } catch {}
}
