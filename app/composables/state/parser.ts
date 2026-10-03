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
export const ast = shallowRef<unknown>()
export const error = shallowRef<unknown>()
export const parseCost = ref(0)
export const editorCursor = ref(0)
export const outputHoverRange = shallowRef<LocRange | undefined>()

export const currentLanguageId = ref<Language>('yaml')
export const currentParserId = ref<string | undefined>()

export const overrideVersion = ref<string>()
export const displayVersion = ref<string>()
export const parserVersionError = shallowRef<string>()
export const isUrlVersion = computed(() => isUrl(overrideVersion.value || ''))
const userApprovedUrlVersion = shallowRef<string>()
const overrideVersionInputError = shallowRef<string>()

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
  clearOverrideVersion()
  currentParserId.value = id
}

export function setOverrideVersion(version?: string) {
  return applyOverrideVersion(version, true)
}

export function restoreOverrideVersion(version?: string) {
  return applyOverrideVersion(version, false)
}

function applyOverrideVersion(version: unknown, allowUrl: boolean) {
  const validated = validateParserVersion(version, allowUrl)
  overrideVersionInputError.value = validated.error
  overrideVersion.value = validated.value
  userApprovedUrlVersion.value =
    allowUrl && validated.url ? validated.value : undefined
  return !validated.error
}

export function clearOverrideVersion() {
  overrideVersion.value = undefined
  userApprovedUrlVersion.value = undefined
  overrideVersionInputError.value = undefined
}

const parserModuleCache = new Map<string, Promise<unknown>>()

async function initParser() {
  const { pkgName, init, versionOverridable } = currentParser.value
  const validated = validateParserVersion(overrideVersion.value, true)
  if (overrideVersionInputError.value || validated.error) {
    throw new Error(overrideVersionInputError.value || validated.error)
  }
  const requestedVersion = validated.value
  const urlVersion = validated.url
  const pkgId = urlVersion
    ? requestedVersion!
    : `${pkgName}${requestedVersion ? `@${requestedVersion}` : ''}`
  if (urlVersion && userApprovedUrlVersion.value !== pkgId) {
    throw new Error('Remote parser URLs must be applied manually')
  }
  const cached = parserModuleCache.get(pkgId)
  if (cached) {
    return cached
  }
  const pending = Promise.resolve().then(() =>
    urlVersion
      ? importUrl(pkgId)
      : requestedVersion && versionOverridable !== false
        ? importJsdelivr(pkgName, requestedVersion)
        : init?.(pkgId),
  )
  parserModuleCache.set(pkgId, pending)
  pending.catch(() => {
    if (parserModuleCache.get(pkgId) === pending) {
      parserModuleCache.delete(pkgId)
    }
  })
  return pending
}

const parserModulePromise = computed(() => initParser())
const parserModule = shallowRef<unknown>()
export const parserContext = computed(() => ({
  ...currentParser.value,
  module: parserModule.value,
}))

export function initParserModule() {
  watch(
    currentLanguage,
    language => {
      code.value = language.codeTemplate
    },
    { flush: 'sync' },
  )

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
    async ([modulePromise, source], _previous, onCleanup) => {
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      const parser = currentParser.value
      const options = parserOptions.value
      const optionsError = parserOptionsError.value
      ast.value = undefined
      error.value = undefined
      parserModule.value = undefined
      parseCost.value = 0
      outputHoverRange.value = undefined

      try {
        loading.value = 'load'

        const ctx = await modulePromise

        if (cancelled) {
          return
        }
        parserModule.value = ctx
        if (optionsError) {
          throw new Error(`Failed to parse options\n${optionsError}`)
        }
        loading.value = 'parse'

        const t = window.performance.now()

        const result = await parser.parse.call(ctx, source, options)
        if (cancelled) {
          return
        }
        ast.value = result
        parseCost.value = window.performance.now() - t
        error.value = null
      } catch (err: unknown) {
        if (!cancelled) {
          error.value = err
        }
      } finally {
        if (!cancelled) {
          loading.value = false
        }
      }
    },
    {
      immediate: true,
    },
  )

  watch(
    [currentParserId, overrideVersion, overrideVersionInputError],
    async (_value, _previous, onCleanup) => {
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      const parser = currentParser.value
      const requestedVersion = overrideVersion.value
      parserVersionError.value = undefined

      try {
        const validated = validateParserVersion(requestedVersion, true)
        if (overrideVersionInputError.value || validated.error) {
          throw new Error(overrideVersionInputError.value || validated.error)
        }
        if (requestedVersion) {
          displayVersion.value = requestedVersion
          if (!isUrlVersion.value) {
            const version = await fetchVersion(parser.pkgName, requestedVersion)
            if (!cancelled) {
              displayVersion.value = version
            }
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

        if (!cancelled) {
          displayVersion.value = version
        }
      } catch (err) {
        if (!cancelled) {
          parserVersionError.value =
            err instanceof Error ? err.message : String(err)
          displayVersion.value = overrideVersion.value || ''
        }
      }
    },
    {
      immediate: true,
    },
  )
}
