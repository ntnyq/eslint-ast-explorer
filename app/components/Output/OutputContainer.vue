<script lang="ts" setup>
import { EyeOff, LoaderCircle, Printer, Search } from '@lucide/vue'

const errorString = computed(() => {
  if (!error.value) {
    return ''
  }
  return (error.value as Error).stack || (error.value as Error).message
})

const hideKeysValue = shallowRef(hideKeys.value.join(', '))
const searchValue = computed({
  get: () => outputSearch.value,
  set: value => {
    outputSearch.value = String(value)
  },
})
const hideEmptyKeysValue = computed({
  get: () => hideEmptyKeys.value,
  set: value => {
    hideEmptyKeys.value = value
  },
})

watch(
  hideKeysValue,
  value => {
    hideKeys.value = value
      .split(',')
      .map(key => key.trim())
      .filter(Boolean)
  },
  {
    immediate: true,
  },
)

function toggleAutoFocus(checked: boolean) {
  autoFocus.value = checked
  if (outputView.value === 'json' && hideLocationData.value && checked) {
    hideLocationData.value = false
  }
}

function toggleHideLocationData(checked: boolean) {
  hideLocationData.value = checked
  if (outputView.value === 'json' && autoFocus.value && checked) {
    autoFocus.value = false
  }
}

function printAst() {
  console.info(ast.value)
}
</script>

<template>
  <section
    class="bg-card min-h-[50vh] flex flex-col overflow-hidden border rounded-lg lg:min-h-0"
  >
    <div
      class="border-border/70 flex flex-wrap items-center gap-2 border-b px-2 py-2"
    >
      <div class="relative min-w-48 flex-1">
        <Search
          aria-hidden="true"
          class="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
        />
        <Input
          v-model="searchValue"
          class="h-8 pl-8 font-mono text-sm"
          placeholder="Search AST"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm">
        <label class="flex items-center gap-2 whitespace-nowrap">
          <Switch
            @update:checked="toggleAutoFocus"
            :checked="autoFocus"
          />
          <span>Auto focus</span>
        </label>
        <label class="flex items-center gap-2 whitespace-nowrap">
          <Switch v-model:checked="hideEmptyKeysValue" />
          <span>Empty keys</span>
        </label>
        <label class="flex items-center gap-2 whitespace-nowrap">
          <Switch
            @update:checked="toggleHideLocationData"
            :checked="hideLocationData"
          />
          <span>Location</span>
        </label>
      </div>

      <div class="flex min-w-48 items-center gap-2">
        <div class="relative flex-1">
          <EyeOff
            aria-hidden="true"
            class="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
          />
          <Input
            v-model="hideKeysValue"
            class="h-8 pl-8 font-mono text-sm"
            placeholder="Hide keys"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                @click="printAst"
                type="button"
                size="icon"
                variant="ghost"
                class="size-8"
                aria-label="Print AST in console"
              >
                <Printer
                  aria-hidden="true"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print AST</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <div class="min-h-0 min-w-0 flex flex-1">
      <div
        v-if="loading === 'load'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <LoaderCircle
          aria-hidden="true"
          class="size-4 animate-spin"
        />
        <span>Loading parser...</span>
      </div>
      <div
        v-else-if="loading === 'parse'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <LoaderCircle
          aria-hidden="true"
          class="size-4 animate-spin"
        />
        <span>Parsing...</span>
      </div>
      <div
        v-else-if="error"
        class="bg-destructive/5 text-destructive h-full w-full overflow-auto p-3 text-sm"
      >
        <pre class="whitespace-pre-wrap font-mono">{{ errorString }}</pre>
      </div>
      <div
        v-show="!loading && !error"
        class="h-full min-w-0 w-full"
      >
        <OutputJson
          v-if="outputView === 'json'"
          class="h-full min-h-[50vh] w-full lg:min-h-0"
        />
        <OutputTree
          v-else
          class="h-full min-h-[50vh] w-full lg:min-h-0"
        />
      </div>
    </div>
  </section>
</template>
