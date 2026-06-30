<script setup lang="ts">
import { DialogDescription } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<
  DialogDescriptionProps & { class?: HTMLAttributes['class'] }
>()
</script>

<template>
  <DialogDescription
    v-bind="props"
    :class="cn('text-muted-foreground text-sm', props.class)"
    data-slot="dialog-description"
  >
    <slot />
  </DialogDescription>
</template>
