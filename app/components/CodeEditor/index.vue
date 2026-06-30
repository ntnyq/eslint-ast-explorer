<script lang="ts" setup>
import { LoaderCircle } from '@lucide/vue'
import type * as Monaco from 'monaco-editor'
import type { MonacoLanguage } from '#imports'

const props = defineProps<{
  language: MonacoLanguage
  input?: boolean
}>()
const code = defineModel<string>()

const containerRef = useTemplateRef<{
  $editor: Monaco.editor.IStandaloneCodeEditor | undefined
}>('containerRef')
const monaco: typeof Monaco = await useMonaco()!

const options = computed<Monaco.editor.IStandaloneEditorConstructionOptions>(
  () => ({
    ...getSharedMonacoOptions(),
    fontSize: 14,
    fontLigatures: true,
  }),
)

if (props.input) {
  let hoverDecorationsCollection:
    | Monaco.editor.IEditorDecorationsCollection
    | undefined

  watch(
    () => containerRef.value?.$editor,
    editor => {
      if (!editor) {
        return
      }

      editor.onDidChangeCursorPosition(evt => {
        editorCursor.value = editor.getModel()!.getOffsetAt(evt.position)
      })
    },
    {
      immediate: true,
    },
  )

  watch(
    [outputHoverRange, () => containerRef.value?.$editor],
    ([range, editor]) => {
      hoverDecorationsCollection?.clear()

      if (!range || !editor) {
        return
      }

      const model = editor.getModel()
      if (!model) {
        return
      }

      const start = model.getPositionAt(range[0])
      const end = model.getPositionAt(range[1])

      hoverDecorationsCollection = editor.createDecorationsCollection([
        {
          range: monaco.Range.fromPositions(start, end),
          options: {
            className: 'ast-highlight-range',
            isWholeLine: false,
          },
        },
      ])
    },
    {
      immediate: true,
      flush: 'post',
    },
  )
}
</script>

<template>
  <MonacoEditor
    v-model="code"
    ref="containerRef"
    :lang="language"
    :options
  >
    <div
      class="text-muted-foreground h-full w-full flex flex-col items-center justify-center gap-2"
    >
      <LoaderCircle
        aria-hidden="true"
        class="size-8 animate-spin"
      />
      <span class="text-sm">Loading...</span>
    </div>
  </MonacoEditor>
</template>
