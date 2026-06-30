<script lang="ts" setup>
import { serializeAst } from '~/utils/ast-serializer'
import type * as Monaco from 'monaco-editor'

const monaco: typeof Monaco = await useMonaco()!
const containerRef = useTemplateRef('containerRef')

const options = computed(() => ({
  ...getSharedMonacoOptions(),
  readOnly: true,
  fontSize: 14,
}))

const serialized = computed(() => {
  try {
    return serializeAst(ast.value, {
      hideEmptyKeys: hideEmptyKeys.value,
      hideKeys: hideKeys.value,
      hideLocationData: hideLocationData.value,
      parserHideKeys: currentParser.value.hideKeys || [],
    })
  } catch (err) {
    console.error(err)
    error.value = err
  }
})

const positionMap = computed(() =>
  serialized.value
    ? getLocationMapping(serialized.value, currentParser.value)
    : undefined,
)

const highlightRange = computed<LocRange | undefined>(() => {
  return Array.from(positionMap.value?.entries() || []).findLast(
    ([, [start, end]]) =>
      start <= editorCursor.value && end >= editorCursor.value,
  )?.[0]
})

let decorationsCollection:
  | Monaco.editor.IEditorDecorationsCollection
  | undefined
let searchDecorationsCollection:
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
        className: 'ast-highlight-range',
      },
    },
  ])
  if (autoFocus.value) {
    editor.revealPositionNearTop(start)
  }
}

function highlightSearch() {
  searchDecorationsCollection?.clear()

  const query = outputSearch.value.trim()
  const editor: Monaco.editor.IStandaloneCodeEditor | undefined = toRaw(
    containerRef.value?.$editor,
  )
  const model = editor?.getModel()

  if (!editor || !model || !query || !serialized.value) {
    return
  }

  const lowerSerialized = serialized.value.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const ranges: Monaco.editor.IModelDeltaDecoration[] = []
  let index = lowerSerialized.indexOf(lowerQuery)

  while (index >= 0 && ranges.length < 200) {
    const start = model.getPositionAt(index)
    const end = model.getPositionAt(index + query.length)

    ranges.push({
      range: monaco.Range.fromPositions(start, end),
      options: {
        className: 'ast-search-hit',
      },
    })

    index = lowerSerialized.indexOf(lowerQuery, index + lowerQuery.length)
  }

  searchDecorationsCollection = editor.createDecorationsCollection(ranges)
}

watch(
  [highlightRange, () => containerRef.value?.$editor],
  () => {
    highlight()
  },
  {
    immediate: true,
    flush: 'post',
  },
)
watch(
  [outputSearch, serialized, () => containerRef.value?.$editor],
  () => {
    highlightSearch()
  },
  {
    immediate: true,
    flush: 'post',
  },
)
onMounted(() => {
  highlight()
  highlightSearch()
})

onBeforeUnmount(() => {
  decorationsCollection?.clear()
  searchDecorationsCollection?.clear()
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
