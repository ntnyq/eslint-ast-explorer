const PREFIX = 'eslint-ast-explorer:'
const LAST_STATE_KEY = `${PREFIX}last-state`

interface SerializedAppState {
  c?: string
  l?: Language
  o?: string
  p?: string
  v?: string
}

let urlStateInitialized = false

export function initUrlState() {
  if (urlStateInitialized) {
    return
  }
  urlStateInitialized = true

  const state = readInitialState()

  if (state?.l && state.l in LANGUAGES) {
    currentLanguageId.value = state.l
  }
  if (state?.p) {
    currentParserId.value = state.p
  }
  if (state?.v) {
    overrideVersion.value = state.v
  }
  if (state?.o) {
    rawOptions.value = state.o
  }
  code.value =
    state?.c === undefined || state.c === ''
      ? currentLanguage.value.codeTemplate
      : state.c

  watchEffect(() => {
    const serialized = JSON.stringify({
      l: currentLanguageId.value,
      p: currentParser.value.id,
      c: code.value === currentLanguage.value.codeTemplate ? '' : code.value,
      o: rawOptions.value,
      v: overrideVersion.value,
    } satisfies SerializedAppState)

    window.history.replaceState(null, '', `#${encodeUrlState(serialized)}`)
    window.localStorage.setItem(LAST_STATE_KEY, serialized)
  })
}

function readInitialState() {
  const hashState = parseStateFromHash()
  if (hashState) {
    return hashState
  }

  const serialized = window.localStorage.getItem(LAST_STATE_KEY)
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
