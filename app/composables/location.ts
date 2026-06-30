import jsonToAst from 'json-to-ast'
import type { Parser } from '~/types'

export type LocRange = [start: number, end: number]

type JsonNode =
  | jsonToAst.IdentifierNode
  | jsonToAst.PropertyNode
  | jsonToAst.ValueNode

const nodeLocationFields = {
  range: {
    type: ['type'],
    start: ['range', 0],
    end: ['range', 1],
  },
  startEnd: {
    type: ['type'],
    start: ['start'],
    end: ['end'],
  },
  locOffset: {
    type: ['type'],
    start: ['loc', 'start', 'offset'],
    end: ['loc', 'end', 'offset'],
  },
} as const

export function genGetNodeLocation(
  preset: keyof typeof nodeLocationFields,
): NonNullable<Parser['getNodeLocation']> {
  return (node: unknown, astNode?: boolean) => {
    if (!node || typeof node !== 'object') {
      return
    }

    const fields = nodeLocationFields[preset]
    const read = astNode ? getJsonValue : getValue
    const type = read(node, fields.type)
    if (!type) {
      return
    }

    const start = read(node, fields.start)
    const end = read(node, fields.end)
    if (typeof start !== 'number' || typeof end !== 'number') {
      return
    }

    return [start, end]
  }
}

export const getNodeLocation = genGetNodeLocation('range')

export function getRange(node: unknown) {
  return currentParser.value.getNodeLocation?.(node)
}

export function getLocationMapping(serializedAst: string, parser: Parser) {
  if (!parser.getNodeLocation) {
    return
  }

  const jsonAst = jsonToAst(serializedAst, { loc: true })
  const locationMap = new Map<LocRange, LocRange>()

  traverseJsonNode(jsonAst, node => {
    const sourceRange = parser.getNodeLocation?.(node, true)
    if (!sourceRange || !node.loc) {
      return
    }

    locationMap.set([node.loc.start.offset, node.loc.end.offset], sourceRange)
  })

  return locationMap
}

export function getValue(object: unknown, path: Readonly<(string | number)[]>) {
  let current: any = object

  for (const key of path) {
    if (!current) {
      return
    }
    current = current[key]
  }

  return current
}

export function getJsonValue(
  node: unknown,
  path: Readonly<(string | number)[]>,
) {
  let current = node as JsonNode | undefined

  for (const key of path) {
    if (!current) {
      return
    }

    switch (current.type) {
      case 'Object':
        current = current.children.find(child => child.key.value === key)?.value
        break
      case 'Array':
        current = current.children[key as number]
        break
      default:
        return
    }
  }

  if (current?.type === 'Literal') {
    return current.value
  }

  return current
}

export function isRegExp(value: unknown): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

function traverseJsonNode(node: JsonNode, cb: (node: JsonNode) => void): void {
  cb(node)

  switch (node.type) {
    case 'Array':
    case 'Object':
      node.children.forEach(child => traverseJsonNode(child, cb))
      break
    case 'Property':
      cb(node.key)
      traverseJsonNode(node.value, cb)
      break
    case 'Identifier':
    case 'Literal':
      break
  }
}
