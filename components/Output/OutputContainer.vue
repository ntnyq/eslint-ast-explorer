<script lang="ts" setup>
const errorString = computed(() => {
  if (!error.value) {
    return ''
  }
  return (error.value as Error).stack || (error.value as Error).message
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="min-h-0 min-w-0 flex flex-1">
      <div v-if="loading === 'load'">Loading parser...</div>
      <div v-else-if="loading === 'parse'">Parsing...</div>
      <div
        v-else-if="error"
        class="overflow-scroll text-sm text-red"
      >
        <pre>{{ errorString }}</pre>
      </div>
      <div
        v-show="!loading && !error"
        class="h-full min-w-0 w-full flex"
      >
        <OutputJson class="h-full min-w0 w-full max-sm:min-h-50vh" />
      </div>
    </div>
  </div>
</template>
