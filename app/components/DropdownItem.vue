<script lang="ts" setup>
defineProps<{
  icon?: string
  text?: string
  description?: string
  checked?: boolean
}>()
defineOptions({
  inheritAttrs: false,
})

const elRef = useTemplateRef('elRef')
</script>

<template>
  <div
    v-bind="$attrs"
    ref="elRef"
    :aria-label="text"
    class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray:20"
  >
    <div class="flex items-center gap-2">
      <div
        v-if="icon"
        :class="icon"
      />
      <slot>{{ text }}</slot>
      <div
        v-if="!checked"
        class="h-1.2em w-1.2em"
      />
    </div>

    <div
      v-if="checked"
      class="i-ri:check-line"
    />
  </div>
</template>
