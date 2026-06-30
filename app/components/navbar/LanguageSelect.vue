<script lang="ts" setup>
import { ChevronDown } from 'lucide-vue-next'
import type { Language } from '#imports'

function changeLanguage(language: Language) {
  currentLanguageId.value = language
}

const selectedLanguageId = computed({
  get: () => currentLanguageId.value,
  set: value => changeLanguage(value as Language),
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
        <span
          aria-hidden="true"
          class="bg-muted text-muted-foreground size-5 flex items-center justify-center border rounded text-[10px] font-semibold uppercase"
        >
          {{ currentLanguage.label.slice(0, 2) }}
        </span>
        <span class="font-medium">{{ currentLanguage.label }}</span>
        <ChevronDown
          aria-hidden="true"
          class="size-4 opacity-60"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      class="min-w-44"
    >
      <DropdownMenuRadioGroup v-model="selectedLanguageId">
        <DropdownMenuRadioItem
          v-for="(lang, id) in LANGUAGES"
          :key="id"
          :value="id"
          class="gap-2"
        >
          <span
            aria-hidden="true"
            class="bg-muted text-muted-foreground size-5 flex items-center justify-center border rounded text-[10px] font-semibold uppercase"
          >
            {{ lang.label.slice(0, 2) }}
          </span>
          <span class="flex-1">{{ lang.label }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
