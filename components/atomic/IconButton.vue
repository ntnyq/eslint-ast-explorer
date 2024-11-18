<script lang="ts" setup>
import { NuxtLink } from '#components'

defineProps<{
  icon: string
  title?: string
  to?: string
}>()
</script>

<template>
  <component
    v-tooltip="title"
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :title="title"
    :type="to ? undefined : 'button'"
    class="icon-button aspect-ratio-1 flex-none rounded-full p-1 @hover:bg-primary/15 @hover:color-primary dark:@hover:bg-primary/30"
    role="button"
  >
    <slot>
      <span
        :class="icon"
        class="block"
      />
    </slot>
  </component>
</template>
