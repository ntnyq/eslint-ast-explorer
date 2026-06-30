import { strict as assert } from 'node:assert'
import test from 'node:test'
import {
  createAstTreeIndex,
  formatPrimitiveForAstTree,
} from '../app/utils/ast-tree-index'

test('indexes focus and search visibility in one traversal', () => {
  const ast = {
    type: 'Program',
    body: [
      {
        type: 'Identifier',
        name: 'target',
        range: [4, 10],
      },
      {
        type: 'Literal',
        value: 42,
        range: [12, 14],
      },
    ],
    range: [0, 14],
  }

  const index = createAstTreeIndex({
    cursor: 6,
    getRange: value => {
      if (!value || typeof value !== 'object') {
        return
      }

      return (value as { range?: [number, number] }).range
    },
    root: ast,
    searchQuery: 'target',
    shouldHideKey: key => key === 'range',
  })

  assert.equal(index.containsCursor(ast), true)
  assert.equal(index.childContainsCursor(ast), true)
  assert.equal(index.matchesSearch(ast), true)
  assert.equal(index.matchesSearch(ast.body[0]), true)
  assert.equal(index.matchesSearch(ast.body[1]), false)
})

test('formats primitive search labels consistently', () => {
  assert.equal(formatPrimitiveForAstTree('hello'), '"hello"')
  assert.equal(formatPrimitiveForAstTree(123), '123')
  assert.equal(formatPrimitiveForAstTree(null), 'null')
})
