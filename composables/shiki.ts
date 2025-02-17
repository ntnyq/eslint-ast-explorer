import { createHighlighterCoreSync } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import langAstro from '@shikijs/langs/astro'
import langCss from '@shikijs/langs/css'
import langHtml from '@shikijs/langs/html'
import langJson from '@shikijs/langs/json'
import langSvelte from '@shikijs/langs/svelte'
import langToml from '@shikijs/langs/toml'
import langTs from '@shikijs/langs/typescript'
import langVue from '@shikijs/langs/vue'
import langYaml from '@shikijs/langs/yaml'
import vitesseDark from '@shikijs/themes/vitesse-dark'
import vitesseLight from '@shikijs/themes/vitesse-light'

export const shikiLangs = [
  langTs,
  langVue,
  langJson,
  langHtml,
  langCss,
  langYaml,
  langAstro,
  langSvelte,
  langToml,
]

export const highlighter = createHighlighterCoreSync({
  langs: shikiLangs,
  themes: [vitesseLight, vitesseDark],
  engine: createJavaScriptRegexEngine(),
})

const highlight = useMemoize((code: string, theme: string) => {
  return highlighter.codeToTokens(code, {
    lang: 'typescript',
    theme,
  })
})

export function useHighlightColor(
  content: MaybeRefOrGetter<string | undefined>,
) {
  return computed(() => {
    const code = toValue(content)
    if (code == null) return ''
    const theme = `vitesse-${isDark.value ? 'dark' : 'light'}`
    const result = highlight(code, theme)
    let idx = 0
    if (code.startsWith('"')) {
      idx = 1
    }
    return result.tokens?.[0]?.[idx]?.color
  })
}
