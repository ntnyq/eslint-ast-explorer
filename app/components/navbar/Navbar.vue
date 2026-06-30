<script lang="ts" setup>
import {
  BookOpen,
  Code2,
  GitBranch,
  Settings,
  SlidersHorizontal,
  Zap,
} from '@lucide/vue'
import { META } from '~/constants'
import { repository, version } from '../../../package.json'

// const disableOverrideVersion = computed(() => !currentParser.value.versionOverridable)

const parseCostLabel = computed(() => `${+parseCost.value.toFixed(1)} ms`)
const parserVersionLabel = computed(() =>
  displayVersion.value ? `@${displayVersion.value}` : '',
)

function openParserOptions() {
  showParserOptionsDialog.value = true
}

function openParserVersion() {
  showParserVersionDialog.value = true
}

function openEditorSettings() {
  showEditorSettingsDialog.value = true
}
</script>

<template>
  <header
    class="bg-background flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
  >
    <div
      class="flex flex-wrap items-center gap-3 max-sm:w-full max-sm:justify-between"
    >
      <div class="flex items-baseline gap-1">
        <h1 class="text-lg font-bold leading-none">
          {{ META.appName }}
        </h1>
        <small class="text-muted-foreground text-xs">{{ `v${version}` }}</small>
      </div>
      <LanguageSelect />
      <ParserSelect />
    </div>

    <div
      class="flex flex-wrap items-center gap-2 max-sm:w-full max-sm:justify-between"
    >
      <div class="flex items-center gap-3 text-sm">
        <span
          class="bg-primary/12 text-primary border-primary/20 inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[0.8125rem]"
        >
          <Zap
            aria-hidden="true"
            class="size-3.5"
          />
          {{ parseCostLabel }}
        </span>
        <a
          :href="`https://www.npmjs.com/package/${currentParser.pkgName}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground font-mono hover:underline"
        >
          <span>{{ currentParser.pkgName }}</span>
          <span
            v-if="parserVersionLabel"
            class="text-primary"
            >{{ parserVersionLabel }}</span
          >
        </a>
      </div>

      <TooltipProvider>
        <div class="flex items-center gap-1">
          <OutputViewToggle />

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                @click="openParserOptions"
                type="button"
                size="icon"
                variant="ghost"
                class="size-8"
                aria-label="Parser options"
              >
                <SlidersHorizontal
                  aria-hidden="true"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Parser options</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                @click="openParserVersion"
                type="button"
                size="icon"
                variant="ghost"
                class="size-8"
                aria-label="Parser version"
              >
                <GitBranch
                  aria-hidden="true"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Parser version</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                @click="openEditorSettings"
                type="button"
                size="icon"
                variant="ghost"
                class="size-8"
                aria-label="Editor settings"
              >
                <Settings
                  aria-hidden="true"
                  class="size-4"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editor settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                class="size-8"
                as-child
              >
                <NuxtLink
                  :to="currentParser.link"
                  :title="currentParser.label"
                  :aria-label="currentParser.label"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpen
                    aria-hidden="true"
                    class="size-4"
                  />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {{ currentParser.label }}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                class="size-8"
                as-child
              >
                <NuxtLink
                  :to="`https://github.com/${repository}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  aria-label="GitHub"
                >
                  <Code2
                    aria-hidden="true"
                    class="size-4"
                  />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent> GitHub </TooltipContent>
          </Tooltip>

          <DarkToggle />
        </div>
      </TooltipProvider>
    </div>
  </header>
</template>
