import type * as Monaco from 'monaco-editor'

const PREFIX = 'eslint-ast-explorer:'

export type EditorSettings = Monaco.editor.IEditorOptions &
  Monaco.editor.IGlobalEditorOptions

export const showParserOptionsDialog = shallowRef(false)
export const showParserVersionDialog = shallowRef(false)
export const showEditorSettingsDialog = shallowRef(false)
export const showAstTreeStylesDialog = shallowRef(false)

export const editorSettings = useLocalStorage<EditorSettings>(
  `${PREFIX}editor-settings`,
  {
    fontSize: 14,
    fontLigatures: true,
    lineNumbers: 'on',
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    wordWrap: 'off',
  },
)

export const astTreeStyles = useLocalStorage<Record<string, string | number>>(
  `${PREFIX}ast-tree-styles`,
  {
    fontSize: '14px',
    lineHeight: '1.5rem',
  },
)
