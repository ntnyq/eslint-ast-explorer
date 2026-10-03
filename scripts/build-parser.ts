import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import nodePolyfills from '@rolldown/plugin-node-polyfills'
import { build } from 'rolldown'
import Replace from 'unplugin-replace/rolldown'
import { resolve } from './utils'
import type { ConsolaInstance } from 'consola'

const required = createRequire(import.meta.url)

const NUXT_CACHE_DIR = '.nuxt/cache'
const ENTRY = 'virtual:entry'
const BROWSER_MODULE = 'virtual:browser-node-module'
const CACHE_DIR = resolve(NUXT_CACHE_DIR)

interface BuildESLintParserOptions {
  noCache?: boolean
}

export async function buildESLintParser(
  logger: ConsolaInstance,
  parserPackage: string,
  options: BuildESLintParserOptions = {},
) {
  const needsNodePolyfills = [
    'astro-eslint-parser',
    '@typescript-eslint/parser',
    'vue-eslint-parser',
    'toml-eslint-parser',
    'yaml-eslint-parser',
  ].includes(parserPackage)
  const { noCache = false } = options
  const { version } = required(`${parserPackage}/package.json`)
  const fingerprint = createHash('sha256')
    .update(await readFile(new URL(import.meta.url)))
    .update(await readFile(resolve('pnpm-lock.yaml')))
    .digest('hex')
    .slice(0, 12)
  const cacheFile = `${parserPackage.replaceAll('/', '__')}@${version}-${fingerprint}.js`
  const CACHE_PATH = resolve(NUXT_CACHE_DIR, cacheFile)

  await mkdir(CACHE_DIR, { recursive: true })

  if (!noCache) {
    const cache = await readFile(CACHE_PATH, 'utf-8').catch(() => null)
    if (cache) {
      logger.info(`Using cache from ${CACHE_PATH}`)
      return cache
    }
  }

  const t = performance.now()

  logger.start(`Building ${parserPackage} start ...`)

  const output = await build({
    input: [ENTRY],
    write: false,
    platform: 'browser',
    // Vite processes the official Astro browser loader's WASM and worker URLs.
    external: ['eslint', '@astrojs/compiler-binding'],
    resolve: {
      /// keep-sorted
      alias: {
        'fs/promises': 'unenv/runtime/mock/proxy',
        'node:fs': 'unenv/runtime/mock/proxy',
        'node:fs/promises': 'unenv/runtime/mock/proxy',
        'node:module': 'unenv/runtime/node/module/index',
        'node:path': 'pathe',
        ...(needsNodePolyfills
          ? {
              'node:util': 'unenv/runtime/node/util/index',
              url: 'unenv/runtime/node/url/index',
            }
          : {
              'node:util': 'unenv/runtime/mock/proxy',
              assert: 'unenv/runtime/mock/proxy',
            }),
        fs: 'unenv/runtime/mock/proxy',
        module: 'unenv/runtime/node/module/index',
        // ...(parserPackage.startsWith('astro')
        //   ? {
        //       module: 'unenv/runtime/node/module',
        //     }
        //   : {}),
        path: 'pathe',
      },
    },
    output: {
      format: 'esm',
    },
    plugins: [
      {
        name: 'astro-browser-builtins',
        resolveId(id) {
          if (parserPackage !== 'astro-eslint-parser') {
            return
          }
          const builtin = id.replace(/^node:/, '')
          if (builtin === 'module') {
            return BROWSER_MODULE
          }
          if (['fs', 'fs/promises', 'path', 'url', 'util'].includes(builtin)) {
            return required.resolve(`unenv/runtime/node/${builtin}/index`)
          }
        },
        load(id) {
          if (id === BROWSER_MODULE) {
            // Astro receives its script parser explicitly. Node package discovery
            // remains unavailable; its optional filesystem probes must still fail.
            return `export function createRequire() {
              const unavailable = (id) => { throw new Error('Node module resolution is unavailable in the browser: ' + id) }
              return Object.assign(unavailable, { cache: {}, resolve: unavailable })
            }`
          }
        },
      },
      ...(needsNodePolyfills ? [nodePolyfills()] : []),
      {
        name: ENTRY,
        resolveId(id) {
          if (id === ENTRY) {
            return id
          }
        },
        load(id) {
          if (id === ENTRY) {
            return `export { meta, parseForESLint } from '${parserPackage}'`
          }
        },
      },
      ...(parserPackage.startsWith('svelte')
        ? [
            Replace({
              exclude: [],
              values: [
                {
                  find: /process\.cwd\(\)/g,
                  replacement: '"/"',
                },
                {
                  find: 'require.cache',
                  replacement: JSON.stringify({}),
                },
                {
                  find: 'process.versions.node',
                  replacement: JSON.stringify(process.versions.node),
                },
              ],
            }),
          ]
        : []),
      ...(parserPackage.startsWith('vue')
        ? [
            Replace({
              exclude: [],
              values: [
                {
                  find: 'require.cache',
                  replacement: JSON.stringify({}),
                },
              ],
            }),
          ]
        : []),
    ],
  })
  const text = output.output[0].code

  await writeFile(CACHE_PATH, text, 'utf-8')

  logger.success(
    `Built ${parserPackage} in ${Math.round(performance.now() - t)}ms`,
  )

  return text
}
