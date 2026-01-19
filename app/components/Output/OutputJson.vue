<script lang="ts" setup>
import { locationKeyList } from '~/constants/parser'
import type * as Monaco from 'monaco-editor'

const monaco = await useMonaco()!
const containerRef = useTemplateRef('containerRef')

const options = computed(() => ({
  ...getSharedMonacoOptions(),
  readOnly: true,
  fontSize: 14,
}))

const serialized = computed(() => {
  try {
    const seen = new WeakMap<any, unknown>()
    return JSON.stringify(
      ast.value,
      (key: string, value: unknown) => {
        if (hideEmptyKeys.value && value == null) {
          return
        }
        if (
          [
            ...(hideLocationData.value ? locationKeyList : []),
            ...hideKeys.value.filter(v => !!v),
          ].includes(key)
        ) {
          return
        }
        if (typeof value === 'function') {
          return `function ${value.name}(...)`
        }
        if (typeof value === 'bigint') {
          return `(BigInt) ${value}n`
        }

        if (seen.has(value)) {
          return seen.get(value)
        }

        if (value !== null && typeof value === 'object') {
          let newValue: any
          try {
            JSON.stringify(value)
            newValue = value
          } catch {
            newValue = `(circular: ${key || '#root'})`
          }
          seen.set(value, newValue)
        }

        return value
      },
      2,
    )
  } catch (err) {
    console.error(err)
    error.value = err
  }
})

/** AST range -> code range */
// const positionMap = computed(() =>
//   serialized.value ? getLocationMapping(serialized.value, currentParser.value) : undefined,
// )

const highlightRange = computed<LocRange | undefined>(() => {
  return undefined
  // return Array.from(positionMap.value.entries()).findLast(
  //   ([, [start, end]]) => start <= editorCursor.value! && end >= editorCursor.value!,
  // )?.[0]
})

let decorationsCollection:
  | Monaco.editor.IEditorDecorationsCollection
  | undefined

function highlight() {
  decorationsCollection?.clear()

  const range = highlightRange.value
  if (!range) {
    return
  }

  const editor: Monaco.editor.IStandaloneCodeEditor | undefined = toRaw(
    containerRef.value?.$editor,
  )
  if (!editor) {
    return
  }

  const start = editor.getModel()!.getPositionAt(range[0])
  const end = editor.getModel()!.getPositionAt(range[1])

  decorationsCollection = editor.createDecorationsCollection([
    {
      range: monaco.Range.fromPositions(start, end),
      options: {
        className: `important-bg-yellow-400 important-bg-opacity-30`,
      },
    },
  ])
  if (autoFocus.value) {
    editor.revealPositionNearTop(start)
  }
}

watch(
  [() => containerRef.value?.$editor],
  () => {
    highlight()
  },
  {
    immediate: true,
    flush: 'post',
  },
)
onMounted(() => {
  highlight()
})
</script>

<template>
  <MonacoEditor
    ref="containerRef"
    :options
    :model-value="serialized"
    lang="json"
  />
</template>
