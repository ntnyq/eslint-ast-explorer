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
      class="flex flex-center gap-1"
      type="button"
    >
      <div :class="currentLanguage.icon" />
      {{ currentLanguage.label }}
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
