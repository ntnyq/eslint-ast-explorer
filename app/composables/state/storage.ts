const PREFIX = 'eslint-ast-explorer:'

export const showSidebar = useLocalStorage(`${PREFIX}show-sidebar`, true)
export const toggleShowSidebar = useToggle(showSidebar)

export const showInputContainer = useLocalStorage(
  `${PREFIX}show-input-container`,
  true,
)
export const toggleShowInputContainer = useToggle(showInputContainer)

export const showOutputContainer = useLocalStorage(
  `${PREFIX}show-output-container`,
  true,
)
export const toggleShowOutputContainer = useToggle(showOutputContainer)

export const hideEmptyKeys = useLocalStorage(`${PREFIX}hide-empty-keys`, true)
export const hideLocationData = useLocalStorage(
  `${PREFIX}hide-location-data`,
  false,
)

export const hideKeys = useLocalStorage<string[]>(`${PREFIX}hide-keys`, [])
export const autoFocus = useLocalStorage(`${PREFIX}auto-focus`, true)

export const outputView = useLocalStorage<'tree' | 'json'>(
  `${PREFIX}output-view`,
  'tree',
)
