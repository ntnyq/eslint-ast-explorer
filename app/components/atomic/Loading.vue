<script lang="ts" setup>
import { LoaderCircle } from 'lucide-vue-next'

defineProps<{
  text?: string
}>()
</script>

<template>
  <div
    role="status"
    class="text-muted-foreground relative h-full w-full flex flex-col items-center justify-center gap-2"
  >
    <LoaderCircle
      aria-hidden="true"
      class="size-6 animate-spin"
    />
    <span class="text-sm">{{ text ?? 'Loading...' }}</span>
  </div>
</template>
