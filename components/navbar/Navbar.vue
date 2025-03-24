<script lang="ts" setup>
import { META } from '~/constants'
import { repository, version } from '~/package.json'

// const disableOverrideVersion = computed(() => !currentParser.value.versionOverridable)
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 p-2">
    <div class="flex-center flex-wrap gap-4 max-sm:(w-full flex-col gap-2)">
      <div class="mr-8 flex gap-1">
        <h1 class="text-lg font-bold">
          {{ META.appName }}
        </h1>
        <small>{{ `v${version}` }}</small>
      </div>
      <LanguageSelect />
    </div>

    <div class="flex gap-3 max-sm:(w-full flex-col)">
      <div class="flex flex-center gap-3">
        <span class="op-70">{{ +parseCost.toFixed(1) }} ms</span>
        <a
          :href="`https://www.npmjs.com/package/${currentParser.pkgName}`"
          target="_blank"
          rel="noopener noreferrer"
          class="font-mono op-80 hover:underline"
        >
          <span>{{ currentParser.pkgName }}</span>
        </a>
      </div>
      <div class="flex flex-center gap-1">
        <IconButton
          :title="currentParser.label"
          :to="currentParser.link"
          icon="i-ri:book-2-line"
        />
        <IconButton
          :to="`https://github.com/${repository}`"
          title="GitHub"
          icon="i-ri:github-line "
        />
        <DarkToggle />
      </div>
    </div>
  </div>
</template>
