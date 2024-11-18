// Parser
export const loading = ref<'load' | 'parse' | false>(false)

export const code = ref('')
export const ast = shallowRef<unknown>({})
export const error = shallowRef<unknown>()
export const rawOptions = ref('')
export const parseCost = ref(0)
export const editorCursor = ref(0)

export const currentLanguageId = ref<Language>('yaml')
export const currentParserId = ref<string | undefined>()

export const overrideVersion = ref<string>()
export const displayVersion = ref<string>()

export const currentLanguage = computed(
  () => LANGUAGES[currentLanguageId.value] || LANGUAGES.javascript,
)

export const currentParser = computed(
  () =>
    (currentLanguage.value &&
      currentParserId.value &&
      currentLanguage.value.parsers.find(p => p.id === currentParserId.value)) ||
    Object.values(currentLanguage.value.parsers)[0]!,
)

code.value = currentLanguage.value.codeTemplate

export function setParserId(id: string) {
  overrideVersion.value = undefined
  currentParserId.value = id
}

const parserModuleCache: Record<string, unknown> = Object.create(null)

async function initParser() {
  const { pkgName, init } = currentParser.value
  const pkgId = `${pkgName}${overrideVersion.value ? `@${overrideVersion.value}` : ''}`
  if (parserModuleCache[pkgId]) {
    return parserModuleCache[pkgId]
  }
  return (parserModuleCache[pkgId] = await init?.(pkgId))
}

const parserModulePromise = computed(() => initParser())
const parserModule = computedAsync(() => parserModulePromise.value)
export const parserContext = computedWithControl(parserModule, () => ({
  ...currentParser.value,
  module: parserModule.value,
}))

if (import.meta.client) {
  // watch code
  watch(currentLanguage, language => {
    code.value = language.codeTemplate
  })

  watch(
    [currentLanguage, currentParserId],
    () => {
      if (
        !currentParserId.value ||
        !currentLanguage.value.parsers.some(p => p.id === currentParserId.value)
      ) {
        setParserId(currentLanguage.value.parsers[0]?.id || '')
      }
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )

  watch(
    [parserModulePromise, code, rawOptions],
    async () => {
      const id = currentParser.value.id

      try {
        loading.value = 'load'

        const ctx = await parserModulePromise.value

        if (currentParser.value.id !== id) return
        loading.value = 'parse'

        const t = window.performance.now()

        ast.value = await currentParser.value.parse.call(ctx, code.value, {})
        parseCost.value = window.performance.now() - t
        error.value = null
      } catch (err: unknown) {
        console.error(err)
        if (currentParser.value.id === id) {
          error.value = err
        }
      } finally {
        loading.value = false
      }
    },
    {
      immediate: true,
    },
  )
}
