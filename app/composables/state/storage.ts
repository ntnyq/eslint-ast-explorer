const PREFIX = 'eslint-ast-explorer:'
const TRUE = true as boolean
const FALSE = false as boolean

export const showSidebar = useLocalStorage(`${PREFIX}show-sidebar`, TRUE)
export const toggleShowSidebar = useToggle(showSidebar)

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

export const outputView = useLocalStorage<'tree' | 'json'>(
  `${PREFIX}output-view`,
  'tree',
)
