<script lang="ts" setup>
import { Check, ChevronDown, Package } from '@lucide/vue'

const selectedParserId = computed({
  get: () => currentParser.value.id,
  set: value => setParserId(String(value)),
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="h-8 gap-2 px-3"
      >
        <Package
          aria-hidden="true"
          class="size-4"
        />
        <span class="max-w-40 truncate font-medium">{{
          currentParser.label
        }}</span>
        <ChevronDown
          aria-hidden="true"
          class="size-4 opacity-60"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      class="min-w-56"
    >
      <DropdownMenuRadioGroup v-model="selectedParserId">
        <DropdownMenuRadioItem
          v-for="parser in currentLanguage.parsers"
          :key="parser.id"
          :value="parser.id"
          class="gap-2"
        >
          <Package
            aria-hidden="true"
            class="text-muted-foreground size-4"
          />
          <span class="flex-1">{{ parser.label }}</span>
          <template #indicator-icon>
            <Check class="size-3.5" />
          </template>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
