import { strict as assert } from 'node:assert'
import test from 'node:test'
import { serializeAst } from '../app/utils/ast-serializer'

test('serializes circular ast references without recursive stringify probes', () => {
  const ast: Record<string, unknown> = {
    child: {
      type: 'Identifier',
    },
    type: 'Program',
  }
  ;(ast.child as Record<string, unknown>).parent = ast

  const originalStringify = JSON.stringify
  let stringifyCalls = 0

  JSON.stringify = ((...args: Parameters<typeof JSON.stringify>) => {
    stringifyCalls += 1
    return originalStringify(...args)
  }) as typeof JSON.stringify

  try {
    const serialized = serializeAst(ast, {
      hideEmptyKeys: false,
      hideKeys: [],
      hideLocationData: false,
      parserHideKeys: [],
    })

    assert.match(serialized, /"type": "Program"/)
    assert.match(serialized, /"parent": "\(circular: parent\)"/)
    assert.equal(stringifyCalls, 1)
  } finally {
    JSON.stringify = originalStringify
  }
})
