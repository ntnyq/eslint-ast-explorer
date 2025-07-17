import themeDark from '@shikijs/themes/dark-plus'
import themeLight from '@shikijs/themes/light-plus'
import type * as Monaco from 'monaco-editor'

export function getSharedMonacoOptions() {
  const options: Monaco.editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    tabSize: 2,
    theme: isDark.value ? themeDark.name : themeLight.name,
    fontFamily:
      // cSpell: disable-next-line
      '"Cascadia Code", "Jetbrains Mono", "Fira Code", "Menlo", "Consolas", monospace',
    minimap: {
      enabled: false,
    },
  }
  return options
}
