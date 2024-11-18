const PREFIX = 'eslint-ast-explorer:'

export const hideEmptyKeys = useLocalStorage(`${PREFIX}hide-empty-keys`, true)
export const hideLocationData = useLocalStorage(`${PREFIX}hide-location-data`, false)

export const hideKeys = useLocalStorage<string[]>(`${PREFIX}hide-keys`, [])
export const autoFocus = useLocalStorage(`${PREFIX}auto-focus`, true)

export const outputView = useLocalStorage<'tree' | 'json'>(`${PREFIX}output-view`, 'tree')
