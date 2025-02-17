import consola from 'consola'
import { buildESLintParser } from './build-parser'

buildESLintParser(consola, 'jsonc-eslint-parser', { noCache: true })
buildESLintParser(consola, 'svelte-eslint-parser', {
  replace: true,
  noCache: true,
})
// buildESLintParser(consola, 'astro-eslint-parser', true)
// buildESLintParser(consola, 'vue-eslint-parser', true)
