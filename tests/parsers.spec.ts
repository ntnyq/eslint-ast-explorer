import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const javascript = 'const answer = 42;\nexport const message = "hello";'
const cases = [
  {
    language: 'astro',
    label: 'Astro',
    parser: 'astro-eslint-parser',
    parserLabel: 'astro-eslint-parser',
    valid: '---\nconst name = "Ada";\n---\n<h1>Hello {name}</h1>',
    invalid: '---\nconst =\n---\n<h1 />',
    node: 'AstroFragment',
  },
  {
    language: 'javascript',
    label: 'JavaScript',
    parser: 'esprima',
    parserLabel: 'esprima',
    valid: javascript,
    invalid: 'const =',
    node: 'ExportNamedDeclaration',
  },
  {
    language: 'javascript',
    label: 'JavaScript',
    parser: 'espree',
    parserLabel: 'espree',
    valid: javascript,
    invalid: 'const =',
    node: 'ExportNamedDeclaration',
  },
  {
    language: 'javascript',
    label: 'JavaScript',
    parser: 'babel-parser',
    parserLabel: '@babel/parser',
    valid: javascript,
    invalid: 'const =',
    node: 'ExportNamedDeclaration',
  },
  {
    language: 'javascript',
    label: 'JavaScript',
    parser: 'typescript-eslint-parser',
    parserLabel: '@typescript-eslint/parser',
    valid:
      'interface User { name: string }\nconst user = { name: "Ada" } satisfies User;',
    invalid: 'const =',
    node: 'TSSatisfiesExpression',
  },
  {
    language: 'json',
    label: 'Json',
    parser: 'jsonc-eslint-parser',
    parserLabel: 'jsonc-eslint-parser',
    valid: '{"name":"Ada","count":42,"active":true}',
    invalid: '{"name":}',
    node: 'JSONObjectExpression',
  },
  {
    language: 'svelte',
    label: 'Svelte',
    parser: 'svelte-eslint-parser',
    parserLabel: 'svelte-eslint-parser',
    valid:
      '<script>let count = 0;</script>\n<button onclick={() => count++}>{count}</button>',
    invalid: '<script>const =</script>',
    node: 'SvelteElement',
  },
  {
    language: 'toml',
    label: 'TOML',
    parser: 'toml-eslint-parser',
    parserLabel: 'toml-eslint-parser',
    valid: 'title = "Hello"\n[owner]\nname = "Ada"\nage = 42\nactive = true',
    invalid: 'name = @',
    node: 'TOMLKeyValue',
  },
  {
    language: 'vue',
    label: 'Vue',
    parser: 'vue-eslint-parser',
    parserLabel: 'vue-eslint-parser',
    valid:
      '<script setup>let count = 0;</script>\n<template><button @click="count++">{{ count }}</button></template>',
    invalid: '<script>const =</script><template><div /></template>',
    node: 'VElement',
  },
  {
    language: 'yaml',
    label: 'YAML',
    parser: 'yaml-eslint-parser',
    parserLabel: 'yaml-eslint-parser',
    valid: 'name: Ada\ncount: 42\nactive: true\nitems:\n  - one\n  - two',
    invalid: 'name: @invalid',
    node: 'YAMLMapping',
  },
]

type ParserCase = (typeof cases)[number]
declare global {
  interface Window {
    __capturedAst?: unknown
    __parserCalls?: string[]
  }
}

function hashFor(item: ParserCase) {
  return Buffer.from(
    JSON.stringify({ l: item.language, p: item.parser }),
  ).toString('base64')
}

async function ready(page: Page) {
  await expect(
    page.getByRole('button', { name: 'Print AST in console', exact: true }),
  ).toBeEnabled()
  await expect(
    page.getByRole('region', { name: 'AST output' }).getByRole('alert'),
  ).toHaveCount(0)
}

async function input(page: Page, source: string) {
  const editor = page
    .getByRole('region', { name: 'Source code' })
    .locator('[aria-label="Editor content"]')
  await editor.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.evaluate(text => navigator.clipboard.writeText(text), source)
  await page.keyboard.press('ControlOrMeta+V')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem('eslint-ast-explorer:last-state') || '{}',
          ).c,
      ),
    )
    .toBe(source)
}

async function readAst(page: Page) {
  await page.evaluate(() => {
    window.__capturedAst = undefined
    console.info = (value: unknown) => {
      window.__capturedAst = value
    }
  })
  await page
    .getByRole('button', { name: 'Print AST in console', exact: true })
    .click()
  return page.evaluate(() => {
    const types: Record<string, number> = {}
    const seen = new WeakSet<object>()
    function visit(value: unknown) {
      if (!value || typeof value !== 'object' || seen.has(value)) {
        return
      }
      seen.add(value)
      const record = value as Record<string, unknown>
      if (typeof record.type === 'string') {
        types[record.type] = (types[record.type] || 0) + 1
      }
      for (const [key, child] of Object.entries(record)) {
        if (
          ![
            'parent',
            'tokens',
            'comments',
            'scopeManager',
            'services',
          ].includes(key)
        ) {
          visit(child)
        }
      }
    }
    visit(window.__capturedAst)
    return types
  })
}

async function colors(page: Page) {
  return page
    .getByRole('region', { name: 'Source code' })
    .locator('.view-line span[class^="mtk"]')
    .evaluateAll(elements => [
      ...new Set(
        elements
          .filter(element => element.textContent?.trim())
          .map(element => getComputedStyle(element).color),
      ),
    ])
}

async function choose(page: Page, oldName: string, newName: string) {
  await page.getByRole('button', { name: oldName, exact: true }).click()
  await page.getByRole('menuitemradio', { name: newName, exact: true }).click()
  await expect(page.getByRole('menuitemradio')).toHaveCount(0)
}

for (const item of cases) {
  test(`${item.label} / ${item.parser}: sample, input, recovery, highlight, refresh`, async ({
    page,
  }, info) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    const httpErrors: string[] = []
    const externalParsers: string[] = []
    const workers: string[] = []
    const wasmResponses: number[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })
    page.on('response', response => {
      if (response.status() >= 400) {
        httpErrors.push(`${response.status()} ${response.url()}`)
      }
      if (response.url().endsWith('.wasm')) {
        wasmResponses.push(response.status())
      }
    })
    page.on('requestfailed', request =>
      failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`),
    )
    page.on('request', request => {
      if (/cdn\.(?:skypack\.dev|jsdelivr\.net)/.test(request.url())) {
        externalParsers.push(request.url())
      }
    })
    page.on('worker', worker => workers.push(worker.url()))
    await page.goto(`/#${hashFor(item)}`)
    await ready(page)
    const sample = await readAst(page)
    expect(Object.keys(sample).length).toBeGreaterThan(1)
    await input(page, item.valid)
    await ready(page)
    const valid = await readAst(page)
    expect(valid[item.node]).toBeGreaterThan(0)
    await expect
      .poll(async () => (await colors(page)).length)
      .toBeGreaterThan(1)
    const tokenColors = await colors(page)
    await input(page, item.invalid)
    await expect(
      page.getByRole('region', { name: 'AST output' }).getByRole('alert'),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Print AST in console', exact: true }),
    ).toBeDisabled()
    await expect(page.getByLabel('Parse duration')).toHaveText('0 ms')
    await input(page, item.valid)
    await ready(page)
    expect((await readAst(page))[item.node]).toBeGreaterThan(0)
    await page.reload()
    await ready(page)
    expect((await readAst(page))[item.node]).toBeGreaterThan(0)
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(
              localStorage.getItem('eslint-ast-explorer:last-state') || '{}',
            ).c,
        ),
      )
      .toBe(item.valid)
    await expect
      .poll(async () => (await colors(page)).length)
      .toBeGreaterThan(1)
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
    expect(httpErrors).toEqual([])
    expect(externalParsers).toEqual([])
    if (item.language === 'astro') {
      expect(await page.evaluate(() => crossOriginIsolated)).toBe(true)
      expect(workers.length).toBeGreaterThan(0)
      expect(wasmResponses.length).toBeGreaterThan(0)
      expect(wasmResponses.every(status => status === 200)).toBe(true)
    }
    await info.attach('parser-evidence', {
      body: JSON.stringify({
        item,
        sample,
        valid,
        tokenColors,
        pageErrors,
        consoleErrors,
        failedRequests,
        httpErrors,
        workers,
        wasmResponses,
      }),
      contentType: 'application/json',
    })
    await info.attach('highlight', {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
  })
}

test('all UI options survive repeated parser/language switches and browser history', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  let current = cases[0]!
  await page.goto(`/#${hashFor(current)}`)
  await ready(page)
  for (let round = 0; round < 3; round++) {
    for (const item of cases) {
      if (item.language !== current.language) {
        await choose(page, current.label, item.label)
        const first = cases.find(
          candidate => candidate.language === item.language,
        )!
        if (item.parser !== first.parser) {
          await choose(page, first.parserLabel, item.parserLabel)
        }
      } else if (item.parser !== current.parser) {
        await choose(page, current.parserLabel, item.parserLabel)
      }
      current = item
      await ready(page)
      await input(page, item.valid)
      await ready(page)
      expect((await readAst(page))[item.node]).toBeGreaterThan(0)
    }
  }
  const yaml = cases.find(item => item.language === 'yaml')!
  const toml = cases.find(item => item.language === 'toml')!
  await choose(page, yaml.label, toml.label)
  await ready(page)
  await input(page, toml.valid)
  await ready(page)
  await page.goBack()
  await ready(page)
  await expect(
    page.getByRole('button', { name: yaml.label, exact: true }),
  ).toBeVisible()
  expect((await readAst(page))[yaml.node]).toBeGreaterThan(0)
  await page.goForward()
  await ready(page)
  await expect(
    page.getByRole('button', { name: toml.label, exact: true }),
  ).toBeVisible()
  expect((await readAst(page))[toml.node]).toBeGreaterThan(0)
  await page.evaluate(hash => {
    location.hash = hash
  }, hashFor(cases[4]!))
  await ready(page)
  await expect(
    page.getByRole('button', {
      name: '@typescript-eslint/parser',
      exact: true,
    }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('TOML token colors and editor background follow the theme toggle', async ({
  page,
}) => {
  const toml = cases.find(item => item.language === 'toml')!
  await page.goto(`/#${hashFor(toml)}`)
  await ready(page)
  await input(page, toml.valid)
  const editor = page
    .getByRole('region', { name: 'Source code' })
    .locator('.monaco-editor')
    .first()
  const background = () =>
    editor.evaluate(element => getComputedStyle(element).backgroundColor)
  const initialBackground = await background()
  const initialColors = await colors(page)
  expect(initialColors.length).toBeGreaterThan(1)
  await page.getByRole('button', { name: /^(Dark|Light) Mode$/ }).click()
  await expect.poll(background).not.toBe(initialBackground)
  await expect.poll(() => colors(page)).not.toEqual(initialColors)
  expect((await colors(page)).length).toBeGreaterThan(1)
  await ready(page)
  expect((await readAst(page))[toml.node]).toBeGreaterThan(0)
  await page.getByRole('button', { name: /^(Dark|Light) Mode$/ }).click()
  await expect.poll(background).toBe(initialBackground)
  await expect.poll(() => colors(page)).toEqual(initialColors)
})

test('late parse results and errors cannot replace the current AST or timing', async ({
  page,
}) => {
  // A controlled async module exercises completion order through the real version dialog.
  // The language matrix above always uses the real, bundled parsers.
  await page.route('**/__test__/delayed-parser.mjs', route =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `export const version = 'test';
      globalThis.__parserCalls = [];
      export async function parseModule(code) {
        globalThis.__parserCalls.push('started:' + code);
        await new Promise(resolve => setTimeout(resolve, code.startsWith('slow') ? 800 : 20));
        globalThis.__parserCalls.push('finished:' + code);
        if (code === 'slow-error') throw new Error('Outdated parse failure');
        return { type: 'Program', body: [{ type: code.startsWith('fast') ? 'FastResult' : 'SlowResult' }] };
      }`,
    }),
  )
  await page.goto(`/#${hashFor(cases[1]!)}`)
  await ready(page)
  await page
    .getByRole('button', { name: 'Parser version', exact: true })
    .click()
  await page
    .getByLabel('Version', { exact: true })
    .fill('http://127.0.0.1:4173/__test__/delayed-parser.mjs')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await ready(page)
  for (const slow of ['slow-result', 'slow-error']) {
    await input(page, slow)
    await expect
      .poll(() =>
        page.evaluate(
          value => window.__parserCalls?.includes(`started:${value}`),
          slow,
        ),
      )
      .toBe(true)
    await expect(page.getByLabel('Parse duration')).toHaveText('0 ms')
    await expect(
      page.getByRole('button', { name: 'Print AST in console', exact: true }),
    ).toBeDisabled()
    await input(page, 'fast-result')
    await ready(page)
    expect((await readAst(page)).FastResult).toBe(1)
    const duration = await page.getByLabel('Parse duration').textContent()
    await expect
      .poll(() =>
        page.evaluate(
          value => window.__parserCalls?.includes(`finished:${value}`),
          slow,
        ),
      )
      .toBe(true)
    await ready(page)
    expect((await readAst(page)).FastResult).toBe(1)
    await expect(page.getByLabel('Parse duration')).toHaveText(duration!)
  }
  await input(page, 'slow-error')
  await choose(page, 'JavaScript', 'TOML')
  await ready(page)
  await input(page, cases[7]!.valid)
  await ready(page)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__parserCalls?.filter(value => value === 'finished:slow-error')
            .length,
      ),
    )
    .toBe(2)
  await ready(page)
  expect((await readAst(page)).TOMLKeyValue).toBeGreaterThan(0)
})

test('a shared URL cannot execute a remote parser without manual approval', async ({
  page,
}) => {
  const remoteRequests: string[] = []
  await page.route('**/__test__/unapproved.mjs', route => {
    remoteRequests.push(route.request().url())
    return route.abort()
  })
  const hash = Buffer.from(
    JSON.stringify({
      l: 'javascript',
      p: 'esprima',
      v: 'http://127.0.0.1:4173/__test__/unapproved.mjs',
    }),
  ).toString('base64')
  await page.goto(`/#${hash}`)
  await ready(page)
  expect((await readAst(page)).Program).toBe(1)
  expect(remoteRequests).toEqual([])
  await expect(page.getByRole('link', { name: 'esprima@4.0.1' })).toBeVisible()
})

test('malformed URL selections fall back to a working parser', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const state of [
    { l: '__proto__', p: [], v: { toString: null } },
    { l: 'toml', p: 'missing-parser' },
  ]) {
    const hash = Buffer.from(JSON.stringify(state)).toString('base64')
    await page.goto(`/#${hash}`)
    await ready(page)
    expect(Object.keys(await readAst(page)).length).toBeGreaterThan(1)
  }
  expect(errors).toEqual([])
})
