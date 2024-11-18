import themeDark from 'shiki/themes/dark-plus.mjs'
import themeLight from 'shiki/themes/light-plus.mjs'
import type * as Monaco from 'monaco-editor'

export function getSharedMonacoOptions() {
  const options: Monaco.editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    tabSize: 2,
    theme: isDark.value ? themeDark.name : themeLight.name,
    // cSpell: disable-next-line
    fontFamily: '"Cascadia Code", "Jetbrains Mono", "Fira Code", "Menlo", "Consolas", monospace',
    minimap: {
      enabled: false,
    },
  }
  return options
}
