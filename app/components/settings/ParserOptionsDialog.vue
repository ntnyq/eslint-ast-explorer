<script lang="ts" setup>
import { RotateCcw, SlidersHorizontal } from '@lucide/vue'

type PrimitiveOption = boolean | number | string

interface OptionEntry {
  key: string
  type: 'boolean' | 'number' | 'string'
  value: PrimitiveOption
}

const open = computed({
  get: () => showParserOptionsDialog.value,
  set: value => {
    showParserOptionsDialog.value = value
  },
})

const rawOptionsValue = computed({
  get: () => rawOptions.value,
  set: value => {
    rawOptions.value = String(value)
  },
})

const optionEntries = computed<OptionEntry[]>(() => {
  const options = parserOptions.value
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return []
  }

  return Object.entries(options as Record<string, unknown>)
    .filter(([, value]) =>
      ['boolean', 'number', 'string'].includes(typeof value),
    )
    .map(([key, value]) => ({
      key,
      type: typeof value as OptionEntry['type'],
      value: value as PrimitiveOption,
    }))
})

function setOption(key: string, value: PrimitiveOption) {
  const options =
    parserOptions.value && typeof parserOptions.value === 'object'
      ? { ...(parserOptions.value as Record<string, unknown>) }
      : {}

  options[key] = value
  parserOptions.value = options
}

function resetOptions() {
  setDefaultOptions()
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <SlidersHorizontal
            aria-hidden="true"
            class="size-5"
          />
          Parser Options
        </DialogTitle>
        <DialogDescription>{{ currentParser.label }}</DialogDescription>
      </DialogHeader>

      <div class="grid min-h-0 gap-4">
        <div
          v-if="optionEntries.length"
          class="grid gap-3 sm:grid-cols-2"
        >
          <div
            v-for="entry in optionEntries"
            :key="entry.key"
            class="bg-muted/40 flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <Label class="font-mono">{{ entry.key }}</Label>
            <Switch
              @update:checked="value => setOption(entry.key, value)"
              v-if="entry.type === 'boolean'"
              :checked="Boolean(entry.value)"
            />
            <Input
              @update:model-value="value => setOption(entry.key, Number(value))"
              v-else-if="entry.type === 'number'"
              :model-value="Number(entry.value)"
              type="number"
              class="h-8 w-28 font-mono"
            />
            <Input
              @update:model-value="value => setOption(entry.key, String(value))"
              v-else
              :model-value="String(entry.value)"
              class="h-8 w-40 font-mono"
            />
          </div>
        </div>

        <Textarea
          v-model="rawOptionsValue"
          class="max-h-[42vh] min-h-72 resize-none font-mono text-sm"
          spellcheck="false"
        />

        <p
          v-if="parserOptionsError"
          class="text-destructive text-sm"
        >
          {{ parserOptionsError }}
        </p>
      </div>

      <DialogFooter>
        <Button
          @click="resetOptions"
          type="button"
          variant="outline"
        >
          <RotateCcw
            aria-hidden="true"
            class="size-4"
          />
          Reset
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
