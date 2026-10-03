import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'
import { fetchVersion, importJsdelivr } from '../app/utils/parser'
import {
  INVALID_PARSER_VERSION,
  validateParserVersion,
} from '../app/utils/parser-version'
import {
  createPersistedUrlState,
  createShareableUrlState,
} from '../app/utils/url-state'
import type { Page } from '@playwright/test'

const invalidVersions = [
  '../../some-other-package',
  '1.0.0/../../some-other-package',
  '..\\..\\some-other-package',
  '%2e%2e%2fsome-other-package',
  '%252e%252e%252fsome-other-package',
  'latest?module=other',
  'latest#fragment',
  '//other.invalid/module.js',
  '@other/package',
  'npm:other-package',
  'data:text/javascript,void 0',
  'javascript:void 0',
  'file:///tmp/parser.js',
  'next\n',
  'next\t',
  'next\u0000',
  '1.2.3.4',
  'a'.repeat(65),
  '1'.repeat(257),
]
const validVersions = [
  '1.2.3',
  '1.2.3-beta.1+build.7',
  '^1.2.3',
  '~1.2.3',
  '>=1.0.0 <2.0.0 || >=3.0.0',
  '1.0.0 - 2.0.0',
  '1.x',
  '*',
  'latest',
  'next',
  'canary-2026.10',
  'beta_1',
]

declare global {
  interface Window {
    __versionProbeExecuted?: string
  }
}

const selection = { l: 'json', p: 'jsonc-eslint-parser' }
function hash(version: string) {
  return Buffer.from(JSON.stringify({ ...selection, v: version })).toString(
    'base64',
  )
}

async function mockCdn(page: Page) {
  const requests: string[] = []
  // Every CDN request is fulfilled locally; no suspicious package is fetched.
  await page.route(
    /^https:\/\/cdn\.(?:jsdelivr\.net|skypack\.dev)\//,
    route => {
      const url = route.request().url()
      requests.push(url)
      return route.fulfill({
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: url.endsWith('/package.json')
          ? 'application/json'
          : 'text/javascript',
        body: url.endsWith('/package.json')
          ? JSON.stringify({ version: '3.3.0' })
          : `globalThis.__versionProbeExecuted = ${JSON.stringify(url)};
          export const meta = { version: '3.3.0' };
          export function parseForESLint() { return { ast: { type: 'Program', body: [] } } }`,
      })
    },
  )
  return requests
}

test('parser version validation accepts semver/ranges and bounded tags only', () => {
  for (const value of validVersions) {
    expect(validateParserVersion(value)).toEqual({ value, url: false })
  }
  for (const value of invalidVersions) {
    expect(validateParserVersion(value).error, value).toBe(
      INVALID_PARSER_VERSION,
    )
    expect(validateParserVersion(value, true).error, value).toBe(
      INVALID_PARSER_VERSION,
    )
  }
  const url = 'https://example.invalid/parser.mjs'
  expect(validateParserVersion(url).error).toContain('must be applied manually')
  expect(validateParserVersion(url, true)).toEqual({ value: url, url: true })
  for (const value of [
    'https://example.invalid\\parser.mjs',
    'https://user:password@example.invalid/parser.mjs',
  ]) {
    expect(validateParserVersion(value, true).error).toContain(
      'Invalid parser URL',
    )
  }
})

test('CDN request helpers reject invalid versions before importing or fetching', async () => {
  for (const value of invalidVersions) {
    expect(() => importJsdelivr('jsonc-eslint-parser', value)).toThrow(
      INVALID_PARSER_VERSION,
    )
    await expect(fetchVersion('jsonc-eslint-parser', value)).rejects.toThrow(
      INVALID_PARSER_VERSION,
    )
  }
})

test('shared and persisted state omit unsafe package versions and module URLs', () => {
  for (const v of [...invalidVersions, 'https://example.invalid/parser.mjs']) {
    expect(JSON.parse(createShareableUrlState({ ...selection, v })!)).toEqual(
      selection,
    )
    expect(JSON.parse(createPersistedUrlState({ ...selection, v })!)).toEqual(
      selection,
    )
  }
})

test('malicious shared versions show an error without CDN requests or module execution', async ({
  page,
}, info) => {
  test.setTimeout(90_000)
  const requests = await mockCdn(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const value of invalidVersions) {
    await page.goto(`/#${hash(value)}`)
    await expect(
      page.getByRole('region', { name: 'AST output' }).getByRole('alert'),
    ).toContainText(INVALID_PARSER_VERSION)
    await expect(
      page.getByRole('button', { name: 'Print AST in console', exact: true }),
    ).toBeDisabled()
    await expect(page.getByLabel('Parse duration')).toHaveText('0 ms')
    expect(
      await page.evaluate(() => window.__versionProbeExecuted),
    ).toBeUndefined()
    expect(requests, value).toEqual([])
  }
  expect(errors).toEqual([])
  await info.attach('rejected-share-versions', {
    body: JSON.stringify({ versions: invalidVersions, requests, errors }),
    contentType: 'application/json',
  })
})

test('manual invalid versions stay in the dialog and cannot reach the CDN', async ({
  page,
}) => {
  const requests = await mockCdn(page)
  await page.goto(
    `/#${Buffer.from(JSON.stringify(selection)).toString('base64')}`,
  )
  await expect(
    page.getByRole('button', { name: 'Print AST in console', exact: true }),
  ).toBeEnabled()
  await page
    .getByRole('button', { name: 'Parser version', exact: true })
    .click()
  const dialog = page.getByRole('dialog')
  for (const value of invalidVersions.filter(value =>
    [...value].every(character => (character.codePointAt(0) ?? 0) > 32),
  )) {
    await dialog.getByLabel('Version', { exact: true }).fill(value)
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
    await expect(dialog.getByRole('alert')).toHaveText(INVALID_PARSER_VERSION)
    expect(
      await page.evaluate(() => window.__versionProbeExecuted),
    ).toBeUndefined()
    expect(requests, value).toEqual([])
  }
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Print AST in console', exact: true }),
  ).toBeEnabled()
})

test('invalid local state is rejected before loading its version', async ({
  page,
}) => {
  const requests = await mockCdn(page)
  await page.addInitScript(
    state =>
      localStorage.setItem(
        'eslint-ast-explorer:last-state',
        JSON.stringify(state),
      ),
    { ...selection, v: invalidVersions[0] },
  )
  await page.goto('/')
  await expect(
    page.getByRole('region', { name: 'AST output' }).getByRole('alert'),
  ).toContainText(INVALID_PARSER_VERSION)
  expect(requests).toEqual([])
  expect(
    await page.evaluate(() => window.__versionProbeExecuted),
  ).toBeUndefined()
})

test('valid shared versions stay inside the selected package URL component', async ({
  page,
}, info) => {
  test.setTimeout(90_000)
  const requests = await mockCdn(page)
  for (const value of validVersions) {
    const prefix = `https://cdn.jsdelivr.net/npm/jsonc-eslint-parser@${encodeURIComponent(value)}`
    await page.goto(`/#${hash(value)}`)
    await expect
      .poll(() => page.evaluate(() => window.__versionProbeExecuted))
      .toBe(`${prefix}/+esm`)
    await expect(
      page.getByRole('button', { name: 'Print AST in console', exact: true }),
    ).toBeEnabled()
    expect(requests).toContain(`${prefix}/package.json`)
    expect(requests).toContain(`${prefix}/+esm`)
  }
  // A browser can emit both popstate and hashchange for one fragment navigation.
  // Every request, including repeated metadata reads, must stay in the package.
  expect(new Set(requests)).toEqual(
    new Set(
      validVersions.flatMap(value => {
        const prefix = `https://cdn.jsdelivr.net/npm/jsonc-eslint-parser@${encodeURIComponent(value)}`
        return [`${prefix}/package.json`, `${prefix}/+esm`]
      }),
    ),
  )
  await info.attach('accepted-version-requests', {
    body: JSON.stringify({ versions: validVersions, requests }),
    contentType: 'application/json',
  })
})
