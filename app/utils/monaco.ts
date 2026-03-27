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

export function configureMonacoDefaults(monaco: typeof Monaco | undefined) {
  if (!monaco) {
    return
  }

  monaco.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    enableSchemaRequest: true,
    trailingCommas: 'ignore',
  })

  monaco.typescript.typescriptDefaults.setCompilerOptions({
    noEmit: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowNonTsExtensions: true,
    jsx: monaco.typescript.JsxEmit.Preserve,
    module: monaco.typescript.ModuleKind.ESNext,
    target: monaco.typescript.ScriptTarget.ESNext,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
  })
}
