<script lang="ts" setup>
import { LoaderCircle } from 'lucide-vue-next'

const errorString = computed(() => {
  if (!error.value) {
    return ''
  }
  return (error.value as Error).stack || (error.value as Error).message
})
</script>

<template>
  <section
    class="bg-card min-h-[50vh] flex flex-col overflow-hidden border rounded-lg lg:min-h-0"
  >
    <div class="min-h-0 min-w-0 flex flex-1">
      <div
        v-if="loading === 'load'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <LoaderCircle
          aria-hidden="true"
          class="size-4 animate-spin"
        />
        <span>Loading parser...</span>
      </div>
      <div
        v-else-if="loading === 'parse'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <LoaderCircle
          aria-hidden="true"
          class="size-4 animate-spin"
        />
        <span>Parsing...</span>
      </div>
      <div
        v-else-if="error"
        class="bg-destructive/5 text-destructive h-full w-full overflow-auto p-3 text-sm"
      >
        <pre class="whitespace-pre-wrap font-mono">{{ errorString }}</pre>
      </div>
      <div
        v-show="!loading && !error"
        class="h-full min-w-0 w-full"
      >
        <OutputJson class="h-full min-h-[50vh] w-full lg:min-h-0" />
      </div>
    </div>
  </section>
</template>
