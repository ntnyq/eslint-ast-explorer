import { strict as assert } from 'node:assert'
import test from 'node:test'
import {
  createPersistedUrlState,
  createShareableUrlState,
  normalizeRestoredUrlState,
} from '../app/utils/url-state'

test('drops URL parser versions from restored state', () => {
  assert.deepEqual(
    normalizeRestoredUrlState({
      l: 'javascript',
      p: 'babel',
      v: 'https://example.com/parser.js',
    }),
    {
      l: 'javascript',
      p: 'babel',
    },
  )
})

test('keeps package parser versions from restored state', () => {
  assert.deepEqual(
    normalizeRestoredUrlState({
      p: 'espree',
      v: 'latest',
    }),
    {
      p: 'espree',
      v: 'latest',
    },
  )
})

test('omits source code, options, and URL versions from shareable state', () => {
  assert.equal(
    createShareableUrlState({
      c: 'const token = "secret"',
      l: 'javascript',
      o: '{"apiKey":"secret"}',
      p: 'babel',
      v: 'https://example.com/parser.js',
    }),
    '{"l":"javascript","p":"babel"}',
  )
})

test('skips over-sized persisted state', () => {
  assert.equal(
    createPersistedUrlState(
      {
        c: 'x'.repeat(10),
        l: 'javascript',
      },
      8,
    ),
    undefined,
  )
})
