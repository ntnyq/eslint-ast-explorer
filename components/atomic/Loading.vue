<script lang="ts" setup>
defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="relative wh-full flex-center">
    <div class="flex gap-1 text-3xl font-bold">
      <div class="i-ri:loader-4-fill animate-spin" />
      <span>{{ text ?? 'Loading...' }}</span>
    </div>
  </div>
</template>
