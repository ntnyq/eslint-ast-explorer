import { isUrl } from './url'

export interface SerializedAppState {
  c?: string
  l?: string
  o?: string
  p?: string
  v?: string
}

export const MAX_SHAREABLE_STATE_LENGTH = 8_000
export const MAX_PERSISTED_STATE_LENGTH = 200_000

export function normalizeRestoredUrlState(
  state: SerializedAppState | undefined,
) {
  if (!state) {
    return
  }

  const restored = { ...state }

  if (restored.v && isUrl(restored.v)) {
    delete restored.v
  }

  return restored
}

export function createShareableUrlState(
  state: SerializedAppState,
  maxLength = MAX_SHAREABLE_STATE_LENGTH,
) {
  const shareable: SerializedAppState = {
    l: state.l,
    p: state.p,
    v: state.v && !isUrl(state.v) ? state.v : undefined,
  }

  return serializeBoundedState(shareable, maxLength)
}

export function createPersistedUrlState(
  state: SerializedAppState,
  maxLength = MAX_PERSISTED_STATE_LENGTH,
) {
  return serializeBoundedState(
    {
      ...state,
      v: state.v && !isUrl(state.v) ? state.v : undefined,
    },
    maxLength,
  )
}

function serializeBoundedState(state: SerializedAppState, maxLength: number) {
  const serialized = JSON.stringify(dropEmptyStateValues(state))

  if (serialized.length > maxLength) {
    return
  }

  return serialized
}

function dropEmptyStateValues(state: SerializedAppState) {
  return Object.fromEntries(
    Object.entries(state).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  )
}
