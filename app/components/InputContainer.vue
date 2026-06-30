<script lang="ts" setup>
import { code } from '#imports'
import type { MonacoLanguage } from '#imports'

const language = computed<MonacoLanguage>(() => {
  const editorLanguage = currentParser.value.editorLanguage
  return typeof editorLanguage === 'function'
    ? editorLanguage(parserOptions.value)
    : editorLanguage
})
</script>

<template>
  <section
    class="bg-card relative min-h-[50vh] overflow-hidden border rounded-lg lg:min-h-0"
  >
    <CodeEditor
      v-model="code"
      :language
      class="h-full w-full"
      input
    />
  </section>
</template>
