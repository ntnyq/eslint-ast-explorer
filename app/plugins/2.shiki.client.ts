import { createHighlighterCoreSync } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { shikiToMonaco } from '@shikijs/monaco'
import themeDark from '@shikijs/themes/dark-plus'
import themeLight from '@shikijs/themes/light-plus'
import { shikiLangs } from '~/composables/shiki'

export default defineNuxtPlugin(async () => {
  const monaco = await useMonaco()
  const highlighter = createHighlighterCoreSync({
    themes: [themeDark, themeLight],
    langs: shikiLangs,
    engine: createJavaScriptRegexEngine(),
  })
  const registered = new Set(
    monaco.languages.getLanguages().map(language => language.id),
  )
  for (const id of highlighter.getLoadedLanguages()) {
    if (!registered.has(id)) {
      monaco.languages.register({ id })
    }
  }
  shikiToMonaco(highlighter, monaco)
})
