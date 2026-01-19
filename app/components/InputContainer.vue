<script lang="ts" setup>
import { code } from '#imports'
import type { MonacoLanguage } from '#imports'

const language = computed<MonacoLanguage>(() => {
  return 'yaml'
})
</script>

<template>
  <div class="relative">
    <CodeEditor
      v-model="code"
      :language
      class="h-full w-full"
    />
  </div>
</template>
