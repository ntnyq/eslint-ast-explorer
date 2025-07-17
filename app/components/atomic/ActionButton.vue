<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    type?: 'icon' | 'button' | 'toggle' | 'toggle-button'
    title?: string
    icon: string
  }>(),
  {
    type: 'icon',
  },
)

const isActive = defineModel<boolean>('active')
</script>

<template>
  <SimpleButton
    v-if="type === 'button'"
    v-bind="props"
  />
  <IconButton
    v-else-if="type === 'icon'"
    v-bind="props"
  />
  <IconToggle
    v-model="isActive"
    v-bind="props"
    v-else-if="type === 'toggle'"
  />
  <ToggleButton
    v-model="isActive"
    v-else-if="type === 'toggle-button'"
    v-bind="props"
  />
</template>
