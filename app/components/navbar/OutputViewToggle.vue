<script lang="ts" setup>
import { Braces, Network } from '@lucide/vue'

const view = computed({
  get: () => outputView.value,
  set: value => {
    outputView.value = value as 'tree' | 'json'
  },
})
</script>

<template>
  <Tabs
    v-model="view"
    class="w-auto"
  >
    <TabsList class="h-8 p-0.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <TabsTrigger
              value="tree"
              class="h-7 w-8 flex-none px-0"
              aria-label="Tree preview"
            >
              <Network
                aria-hidden="true"
                class="size-4"
              />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent>Tree preview</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <TabsTrigger
              value="json"
              class="h-7 w-8 flex-none px-0"
              aria-label="JSON preview"
            >
              <Braces
                aria-hidden="true"
                class="size-4"
              />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent>JSON preview</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TabsList>
  </Tabs>
</template>
