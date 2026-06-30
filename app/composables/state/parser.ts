import { astro } from '../parser/astro'
import { javascript } from '../parser/javascript'
import { json } from '../parser/json'
import { svelte } from '../parser/svelte'
import { toml } from '../parser/toml'
import { vue } from '../parser/vue'
import { yaml } from '../parser/yaml'
import type { LocRange } from '../location'

export type MonacoLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'vue'
  | 'yaml'
  | 'html'
  | 'markdown'
  | 'css'
  | 'svelte'
  | 'astro'
  | 'toml'

export const LANGUAGES = {
  astro,
  javascript,
  json,
  svelte,
  toml,
  vue,
  yaml,
}

export type Language = keyof typeof LANGUAGES

// Parser
export const loading = ref<'load' | 'parse' | false>(false)

export const code = ref('')
export const ast = shallowRef<unknown>({})
export const error = shallowRef<unknown>()
export const parseCost = ref(0)
export const editorCursor = ref(0)
export const outputHoverRange = shallowRef<LocRange | undefined>()

export const currentLanguageId = ref<Language>('yaml')
export const currentParserId = ref<string | undefined>()

export const overrideVersion = ref<string>()
export const displayVersion = ref<string>()
export const isUrlVersion = computed(() => isUrl(overrideVersion.value || ''))

export const currentLanguage = computed(
  () => LANGUAGES[currentLanguageId.value] || LANGUAGES.javascript,
)

export const currentParser = computed(
  () =>
    (currentLanguage.value &&
      currentParserId.value &&
      currentLanguage.value.parsers.find(
        p => p.id === currentParserId.value,
      )) ||
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
  const pkgId = isUrlVersion.value
    ? overrideVersion.value!
    : `${pkgName}${overrideVersion.value ? `@${overrideVersion.value}` : ''}`
  if (parserModuleCache[pkgId]) {
    return parserModuleCache[pkgId]
  }
  if (isUrlVersion.value) {
    return (parserModuleCache[pkgId] = await importUrl(pkgId))
  }
  return (parserModuleCache[pkgId] = await init?.(pkgId))
}

const parserModulePromise = computed(() => initParser())
const parserModule = computedAsync(() => parserModulePromise.value)
export const parserContext = computedWithControl(parserModule, () => ({
  ...currentParser.value,
  module: parserModule.value,
}))

export function initParserModule() {
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

        if (currentParser.value.id !== id) {
          return
        }
        if (parserOptionsError.value) {
          throw new Error(
            `Failed to parse options\n${parserOptionsError.value}`,
          )
        }
        loading.value = 'parse'

        const t = window.performance.now()

        ast.value = await currentParser.value.parse.call(
          ctx,
          code.value,
          parserOptions.value,
        )
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

  watch(
    [currentParserId, overrideVersion],
    async () => {
      const parser = currentParser.value

      if (overrideVersion.value) {
        displayVersion.value = overrideVersion.value
        if (!isUrlVersion.value) {
          displayVersion.value = await fetchVersion(
            `${parser.pkgName}@${overrideVersion.value}`,
          )
        }
        return
      }

      if (typeof parser.version === 'string') {
        displayVersion.value = parser.version
        return
      }

      displayVersion.value = ''
      const version = await Promise.resolve(
        parser.version.call(parserModulePromise.value, parser.pkgName),
      )

      if (currentParser.value.id === parser.id) {
        displayVersion.value = version
      }
    },
    {
      immediate: true,
    },
  )
}
