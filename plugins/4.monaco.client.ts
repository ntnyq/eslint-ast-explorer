export default defineNuxtPlugin({
  name: 'monaco',
  setup() {
    const monaco = useMonaco()!

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
      enableSchemaRequest: true,
      trailingCommas: 'ignore',
    })

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noEmit: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    })
  },
})
