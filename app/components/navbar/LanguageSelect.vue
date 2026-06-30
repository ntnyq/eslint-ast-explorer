<script lang="ts" setup>
import {
  Braces,
  Check,
  ChevronDown,
  CodeXml,
  FileCode2,
  FileJson,
  FileType2,
  ScrollText,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { Language } from '#imports'

const languageIcons = {
  astro: FileCode2,
  javascript: Braces,
  json: FileJson,
  svelte: CodeXml,
  toml: FileType2,
  vue: CodeXml,
  yaml: ScrollText,
} satisfies Record<Language, Component>

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
          class="bg-muted text-muted-foreground size-5 flex items-center justify-center border rounded"
        >
          <component
            :is="languageIcons[currentLanguageId]"
            class="size-3.5"
          />
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
            class="bg-muted text-muted-foreground size-5 flex items-center justify-center border rounded"
          >
            <component
              :is="languageIcons[id]"
              class="size-3.5"
            />
          </span>
          <span class="flex-1">{{ lang.label }}</span>
          <template #indicator-icon>
            <Check class="size-3.5" />
          </template>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
