import { createHighlighterCoreSync } from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { shikiToMonaco } from '@shikijs/monaco'
import themeDark from '@shikijs/themes/dark-plus'
import themeLight from '@shikijs/themes/light-plus'
import { shikiLangs } from '~/composables/shiki'
import type * as Monaco from 'monaco-editor'

export default defineNuxtPlugin({
  name: 'shiki',
  async setup() {
    const monaco: typeof Monaco = await useMonaco()!

    monaco.languages.register({ id: 'vue' })
    monaco.languages.register({ id: 'svelte' })
    monaco.languages.register({ id: 'astro' })

    const highlighter = createHighlighterCoreSync({
      themes: [themeDark, themeLight],
      langs: shikiLangs,
      engine: createJavaScriptRegexEngine(),
    })

    shikiToMonaco(highlighter, monaco)
  },
})
