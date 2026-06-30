<script lang="ts" setup>
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
          :class="currentLanguage.icon"
          aria-hidden="true"
          class="size-4"
        />
        <span class="font-medium">{{ currentLanguage.label }}</span>
        <span
          aria-hidden="true"
          class="i-lucide:chevron-down size-4 opacity-60"
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
            :class="lang.icon"
            aria-hidden="true"
            class="size-4"
          />
          <span class="flex-1">{{ lang.label }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
