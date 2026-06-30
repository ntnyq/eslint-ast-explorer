import { locationKeyList } from '~/constants/parser'
import { currentParser } from './parser'

const PREFIX = 'eslint-ast-explorer:'
const TRUE = true as boolean
const FALSE = false as boolean

export const showInputContainer = useLocalStorage(
  `${PREFIX}show-input-container`,
  TRUE,
)
export const toggleShowInputContainer = useToggle(showInputContainer)

export const showOutputContainer = useLocalStorage(
  `${PREFIX}show-output-container`,
  TRUE,
)
export const toggleShowOutputContainer = useToggle(showOutputContainer)

export const hideEmptyKeys = useLocalStorage(`${PREFIX}hide-empty-keys`, TRUE)
export const hideLocationData = useLocalStorage(
  `${PREFIX}hide-location-data`,
  FALSE,
)

export const hideKeys = useLocalStorage<string[]>(`${PREFIX}hide-keys`, [])
export const autoFocus = useLocalStorage(`${PREFIX}auto-focus`, TRUE)
export const outputSearch = useLocalStorage(`${PREFIX}output-search`, '')

export const outputView = useLocalStorage<'tree' | 'json'>(
  `${PREFIX}output-view`,
  'tree',
)

export function shouldHideKey(
  key: unknown,
  checkValue = false,
  value?: unknown,
) {
  if (checkValue && hideEmptyKeys.value && value == null) {
    return true
  }
  if (hideLocationData.value && locationKeyList.includes(String(key))) {
    return true
  }
  if (hideKeys.value.includes(String(key))) {
    return true
  }
  return currentParser.value.hideKeys?.includes(key as string | number)
}
