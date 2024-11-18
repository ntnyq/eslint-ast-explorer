<script lang="ts" setup>
import type * as Monaco from 'monaco-editor'
import type { MonacoLanguage } from '#imports'

const props = defineProps<{
  language: MonacoLanguage
  input?: boolean
}>()
const code = defineModel<string>()

const containerRef = shallowRef<{
  $editor: Monaco.editor.IStandaloneCodeEditor | undefined
}>()

const options = computed<Monaco.editor.IStandaloneEditorConstructionOptions>(() => ({
  ...getSharedMonacoOptions(),
  fontSize: 14,
  fontLigatures: true,
}))

if (props.input) {
  watch(
    () => containerRef.value?.$editor,
    editor => {
      if (!editor) return

      editor.onDidChangeCursorPosition(evt => {
        editorCursor.value = editor.getModel()!.getOffsetAt(evt.position)
      })
    },
    {
      immediate: true,
    },
  )
}
</script>

<template>
  <MonacoEditor
    v-model="code"
    ref="containerRef"
    :lang="language"
    :options="options"
  >
    <div class="h-full w-full flex flex-center flex-col gap-2">
      <div class="i-ri:loader-2-line animate-spin text-4xl" />
      <span class="text-lg">Loading...</span>
    </div>
  </MonacoEditor>
</template>
