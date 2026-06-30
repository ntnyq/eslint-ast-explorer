declare module 'json-to-ast' {
  namespace jsonToAst {
    interface LocationPoint {
      offset: number
    }

    interface Location {
      end: LocationPoint
      start: LocationPoint
    }

    interface BaseNode {
      type: string
      loc?: Location
    }

    interface IdentifierNode extends BaseNode {
      type: 'Identifier'
      value: string
    }

    interface LiteralNode extends BaseNode {
      type: 'Literal'
      value: unknown
    }

    interface PropertyNode extends BaseNode {
      key: IdentifierNode
      type: 'Property'
      value: ValueNode
    }

    interface ArrayNode extends BaseNode {
      children: ValueNode[]
      type: 'Array'
    }

    interface ObjectNode extends BaseNode {
      children: PropertyNode[]
      type: 'Object'
    }

    type ValueNode =
      | ArrayNode
      | IdentifierNode
      | LiteralNode
      | ObjectNode
      | PropertyNode
  }

  interface JsonToAstOptions {
    loc?: boolean
  }

  function jsonToAst(
    value: string,
    options?: JsonToAstOptions,
  ): jsonToAst.ValueNode

  export default jsonToAst
}
