<script lang="ts" setup>
defineProps<{
  icon: string
  activeClass?: string
}>()

const isChecked = defineModel<boolean>('modelValue')
</script>

<template>
  <IconButton
    @click.prevent="isChecked = !isChecked"
    :class="[
      isChecked ? 'color-primary op-100' : 'op-40',
      activeClass ? { [activeClass]: isChecked } : null,
    ]"
    :icon
    class="icon-toggle @hover:color-inherit @hover:op-100"
  />
</template>
