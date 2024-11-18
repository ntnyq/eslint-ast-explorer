<script lang="ts" setup>
import { code } from '#imports'
import type { MonacoLanguage } from '#imports'

const language = computed<MonacoLanguage>(() => {
  return 'yaml'
})
</script>

<template>
  <div>
    <CodeEditor
      v-model="code"
      :language="language"
      class="h-full w-full"
    />
  </div>
</template>
