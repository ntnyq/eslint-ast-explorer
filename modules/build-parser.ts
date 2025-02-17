import { addTemplate, defineNuxtModule, useLogger } from '@nuxt/kit'
import { buildESLintParser } from '../scripts/build-parser'

export default defineNuxtModule({
  meta: {
    name: 'build-eslint-parser',
  },
  setup() {
    const logger = useLogger('build-eslint-parser')

    addTemplate({
      filename: 'jsonc-eslint-parser',
      getContents: () => buildESLintParser(logger, 'jsonc-eslint-parser'),
    })

    // addTemplate({
    //   filename: 'vue-eslint-parser',
    //   getContents: () => buildESLintParser(logger, 'vue-eslint-parser'),
    // })

    // addTemplate({
    //   filename: 'astro-eslint-parser',
    //   getContents: () => buildESLintParser(logger, 'astro-eslint-parser'),
    // })

    addTemplate({
      filename: 'svelte-eslint-parser',
      getContents: () =>
        buildESLintParser(logger, 'svelte-eslint-parser', {
          replace: true,
        }),
    })
  },
})
