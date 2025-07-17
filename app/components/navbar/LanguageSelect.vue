<script lang="ts" setup>
import type { Language } from '#imports'

function changeLanguage(language: Language) {
  currentLanguageId.value = language
}
</script>

<template>
  <VMenu
    :class="{ dark: isDark }"
    :delay="50"
    placement="bottom-start"
    class="flex"
  >
    <button
      class="flex-center gap-1 px-10px"
      type="button"
    >
      <div :class="currentLanguage.icon" />
      <span class="font-semibold">{{ currentLanguage.label }}</span>
      <div class="i-lucide:chevron-down op-50" />
    </button>

    <template #popper>
      <DropdownItem
        @click="changeLanguage(id)"
        v-for="(lang, id) in LANGUAGES"
        :key="id"
        :icon="lang.icon"
        :text="lang.label"
        :checked="currentLanguageId === id"
      />
    </template>
  </VMenu>
</template>
