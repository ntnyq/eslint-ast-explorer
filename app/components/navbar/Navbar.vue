<script lang="ts" setup>
import { META } from '~/constants'
import { repository, version } from '../../../package.json'

// const disableOverrideVersion = computed(() => !currentParser.value.versionOverridable)
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
    </div>

    <div
      class="flex flex-wrap items-center gap-2 max-sm:w-full max-sm:justify-between"
    >
      <div class="flex items-center gap-3 text-sm">
        <span class="text-muted-foreground"
          >{{ +parseCost.toFixed(1) }} ms</span
        >
        <a
          :href="`https://www.npmjs.com/package/${currentParser.pkgName}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground font-mono hover:underline"
        >
          <span>{{ currentParser.pkgName }}</span>
        </a>
      </div>

      <TooltipProvider>
        <div class="flex items-center gap-1">
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
                  <span
                    aria-hidden="true"
                    class="i-ri:book-2-line size-4"
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
                  <span
                    aria-hidden="true"
                    class="i-ri:github-line size-4"
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
