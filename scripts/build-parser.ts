import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { build } from 'rolldown'
import Replace from 'unplugin-replace/rolldown'
import { resolve } from './utils'
import type { ConsolaInstance } from 'consola'

const required = createRequire(import.meta.url)

const NUXT_CACHE_DIR = '.nuxt/cache'
const ENTRY = 'virtual:entry'
const CACHE_DIR = resolve(NUXT_CACHE_DIR)

interface BuildESLintParserOptions {
  noCache?: boolean
}

export async function buildESLintParser(
  logger: ConsolaInstance,
  parserPackage: string,
  options: BuildESLintParserOptions = {},
) {
  const { noCache = false } = options
  const { version } = required(`${parserPackage}/package.json`)
  const CACHE_PATH = resolve(NUXT_CACHE_DIR, `${parserPackage}@${version}.js`)

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
    external: ['eslint'],
    resolve: {
      /// keep-sorted
      alias: {
        'fs/promises': 'unenv/runtime/mock/proxy',
        'node:fs': 'unenv/runtime/mock/proxy',
        'node:fs/promises': 'unenv/runtime/mock/proxy',
        'node:module': 'unenv/runtime/node/module',
        'node:path': 'pathe',
        'node:util': 'unenv/runtime/mock/proxy',
        assert: 'unenv/runtime/mock/proxy',
        fs: 'unenv/runtime/mock/proxy',
        module: 'unenv/runtime/mock/proxy',
        ...(parserPackage.startsWith('astro')
          ? {
              // module: 'unenv/runtime/node/module',
            }
          : {}),
        path: 'pathe',
      },
    },
    output: {
      format: 'esm',
    },
    plugins: [
      {
        name: ENTRY,
        resolveId(id) {
          if (id === ENTRY) return id
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
