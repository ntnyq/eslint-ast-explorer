<script lang="ts" setup>
import { NuxtLink } from '#components'

const props = defineProps<{
  icon: string
  title?: string
  to?: string
}>()

const isExternalLink = computed(
  () => props.to?.startsWith('http://') || props.to?.startsWith('https://'),
)
</script>

<template>
  <component
    v-tooltip="title"
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :target="isExternalLink ? '_blank' : undefined"
    :title="title"
    :aria-label="title"
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
