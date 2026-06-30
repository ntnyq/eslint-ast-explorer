<script lang="ts" setup>
import { Network, Palette } from '@lucide/vue'

function openAstTreeStyles() {
  showAstTreeStylesDialog.value = true
}
</script>

<template>
  <div class="relative h-full min-w-0 w-full overflow-auto p-3">
    <Button
      @click="openAstTreeStyles"
      type="button"
      variant="ghost"
      size="icon"
      class="absolute right-2 top-2 z-10 size-8"
      aria-label="AST tree style"
    >
      <Palette
        aria-hidden="true"
        class="size-4"
      />
    </Button>

    <div
      v-if="ast"
      :style="astTreeStyles"
    >
      <AstTreeNode
        :value="ast"
        root
        open
      />
    </div>
    <div
      v-else
      class="text-muted-foreground h-full w-full flex flex-col items-center justify-center gap-2 text-sm"
    >
      <Network
        aria-hidden="true"
        class="size-5"
      />
      <span>No AST</span>
    </div>
  </div>
</template>
