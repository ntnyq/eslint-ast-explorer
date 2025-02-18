import consola from 'consola'
import { buildESLintParser } from './build-parser'

buildESLintParser(consola, 'jsonc-eslint-parser', { noCache: true })
buildESLintParser(consola, 'svelte-eslint-parser', { noCache: true })
// buildESLintParser(consola, 'astro-eslint-parser', { noCache: true })
buildESLintParser(consola, 'vue-eslint-parser', { noCache: true })
