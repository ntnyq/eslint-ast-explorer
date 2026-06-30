<script lang="ts" setup>
import { Palette, RotateCcw } from '@lucide/vue'
import json5 from 'json5'

const open = computed({
  get: () => showAstTreeStylesDialog.value,
  set: value => {
    showAstTreeStylesDialog.value = value
  },
})

const rawStyles = shallowRef('')
const rawError = shallowRef<string>()

const fontSize = computed({
  get: () => String(astTreeStyles.value.fontSize || '14px'),
  set: value => {
    setTreeStyles({ fontSize: String(value) })
  },
})
const lineHeight = computed({
  get: () => String(astTreeStyles.value.lineHeight || '1.5rem'),
  set: value => {
    setTreeStyles({ lineHeight: String(value) })
  },
})
const letterSpacing = computed({
  get: () => String(astTreeStyles.value.letterSpacing || '0'),
  set: value => {
    setTreeStyles({ letterSpacing: String(value) })
  },
})

watch(
  open,
  () => {
    rawStyles.value = JSON.stringify(astTreeStyles.value, null, 2)
    rawError.value = undefined
  },
  {
    immediate: true,
  },
)

function setTreeStyles(value: Record<string, string | number>) {
  astTreeStyles.value = {
    ...astTreeStyles.value,
    ...value,
  }
  rawStyles.value = JSON.stringify(astTreeStyles.value, null, 2)
}

function applyRawStyles() {
  try {
    astTreeStyles.value = json5.parse(rawStyles.value)
    rawError.value = undefined
  } catch (err) {
    rawError.value = err instanceof Error ? err.message : String(err)
  }
}

function resetStyles() {
  astTreeStyles.value = {
    fontSize: '14px',
    lineHeight: '1.5rem',
  }
  rawStyles.value = JSON.stringify(astTreeStyles.value, null, 2)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Palette
            aria-hidden="true"
            class="size-5"
          />
          AST Tree Style
        </DialogTitle>
        <DialogDescription>CSSProperties</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="grid gap-2">
            <Label for="tree-font-size">Font size</Label>
            <Input
              v-model="fontSize"
              id="tree-font-size"
              class="font-mono"
            />
          </div>
          <div class="grid gap-2">
            <Label for="tree-line-height">Line height</Label>
            <Input
              v-model="lineHeight"
              id="tree-line-height"
              class="font-mono"
            />
          </div>
          <div class="grid gap-2">
            <Label for="tree-letter-spacing">Letter spacing</Label>
            <Input
              v-model="letterSpacing"
              id="tree-letter-spacing"
              class="font-mono"
            />
          </div>
        </div>

        <Textarea
          v-model="rawStyles"
          class="max-h-[36vh] min-h-56 resize-none font-mono text-sm"
          spellcheck="false"
        />
        <p
          v-if="rawError"
          class="text-destructive text-sm"
        >
          {{ rawError }}
        </p>
      </div>

      <DialogFooter>
        <Button
          @click="resetStyles"
          type="button"
          variant="outline"
        >
          <RotateCcw
            aria-hidden="true"
            class="size-4"
          />
          Reset
        </Button>
        <Button
          @click="applyRawStyles"
          type="button"
        >
          Apply JSON
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
