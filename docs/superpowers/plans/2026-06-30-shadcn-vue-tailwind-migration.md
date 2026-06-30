# shadcn-vue Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully migrate the Nuxt app from UnoCSS/Floating Vue/custom atomic controls to Tailwind CSS and shadcn-vue while preserving the current AST explorer workflow.

**Architecture:** Keep the current Nuxt 4 app structure and parser state model. Replace the styling foundation with Tailwind CSS v4 plus shadcn-vue generated components under `app/components/ui`, then update existing feature components to consume those UI primitives directly.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, Tailwind CSS v4, shadcn-vue, shadcn-nuxt, reka-ui-backed shadcn components, Monaco Editor, VueUse.

---

## File Structure

- Modify `package.json`: remove UnoCSS/Floating Vue dependencies, add Tailwind/shadcn dependencies, keep existing scripts.
- Modify `pnpm-lock.yaml`: update through `pnpm install`.
- Modify `nuxt.config.ts`: remove `@unocss/nuxt` and Floating Vue CSS, add `shadcn-nuxt`, add Tailwind CSS import and Vite plugin.
- Create `components.json`: shadcn-vue configuration for Nuxt, Tailwind CSS, aliases, and icon library.
- Create `app/assets/css/tailwind.css`: Tailwind import, shadcn CSS variables, base layer, app-level scrollbar and view-transition styles.
- Delete `uno.config.ts`: old UnoCSS config and shortcuts.
- Delete `app/styles/vars.css`: old CSS variable source replaced by shadcn variables.
- Modify `app/styles/global.css`: either remove obsolete vars or delete if all remaining styles move to `app/assets/css/tailwind.css`.
- Delete `app/plugins/1.floating-vue.ts`: Floating Vue is replaced by shadcn-vue Tooltip and DropdownMenu.
- Create `app/lib/utils.ts`: `cn()` helper for shadcn-vue components.
- Create shadcn-vue component files under:
  - `app/components/ui/button/`
  - `app/components/ui/dropdown-menu/`
  - `app/components/ui/tooltip/`
- Modify `app/app.vue`: rewrite UnoCSS utility syntax to Tailwind CSS.
- Modify `app/components/navbar/Navbar.vue`: replace atomic buttons with shadcn `Button` and `Tooltip`; rewrite layout classes.
- Modify `app/components/navbar/LanguageSelect.vue`: replace `VMenu` and `DropdownItem` with shadcn `DropdownMenu`.
- Modify `app/components/atomic/DarkToggle.vue`: keep dark-mode transition behavior, render with shadcn `Button` and `Tooltip`.
- Delete unused local atom components after usage is removed:
  - `app/components/DropdownItem.vue`
  - `app/components/atomic/IconButton.vue`
  - `app/components/atomic/IconToggle.vue`
  - `app/components/atomic/ToggleButton.vue`
  - `app/components/atomic/SimpleButton.vue`
  - `app/components/atomic/ActionButton.vue`
- Modify `app/components/atomic/Loading.vue`: rewrite UnoCSS syntax to Tailwind CSS.
- Modify `app/components/InputContainer.vue`: rewrite Tailwind-compatible classes.
- Modify `app/components/Output/OutputContainer.vue`: rewrite status/error UI with Tailwind/shadcn theme tokens.
- Modify `app/components/Output/OutputJson.vue`: rewrite any Uno-only classes.
- Modify `app/components/CodeEditor/index.vue`: rewrite loading fallback classes.
- Modify parser icon handling if needed so icon strings remain renderable after UnoCSS icon utilities are removed.

## Task 1: Add Tailwind/shadcn Foundation

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `nuxt.config.ts`
- Create: `components.json`
- Create: `app/assets/css/tailwind.css`
- Create: `app/lib/utils.ts`

- [ ] **Step 1: Confirm the current baseline**

Run:

```bash
rtk proxy git status --short
rtk pnpm lint
rtk pnpm typecheck
```

Expected:

- `git status --short` only shows the plan file if it has not been committed yet.
- `pnpm lint` and `pnpm typecheck` pass before migration work starts. If either fails on `main`, record the failure output and continue only if the failure is unrelated to this migration.

- [ ] **Step 2: Install and remove dependencies**

Run:

```bash
rtk pnpm add @tailwindcss/vite class-variance-authority clsx lucide-vue-next reka-ui tailwind-merge tailwindcss tw-animate-css
rtk pnpm add -D shadcn-nuxt
rtk pnpm remove @unocss/nuxt @unocss/reset floating-vue
```

Expected:

- `package.json` includes Tailwind and shadcn runtime dependencies.
- `package.json` includes `shadcn-nuxt` in `devDependencies`.
- UnoCSS and Floating Vue packages are removed.
- `pnpm-lock.yaml` updates.

- [ ] **Step 3: Configure Nuxt for Tailwind and shadcn**

Edit `nuxt.config.ts` so the relevant sections match this shape:

```ts
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2026-06-30',

  modules: ['@vueuse/nuxt', 'nuxt-monaco-editor', 'nuxt-umami', 'shadcn-nuxt'],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      legalComments: 'external',
    },
    optimizeDeps: {
      include: [
        '@shikijs/core',
        '@shikijs/engine-javascript',
        '@shikijs/monaco',
        '@shikijs/themes/dark-plus',
        '@shikijs/themes/light-plus',
        'json5',
        '@shikijs/langs/astro',
        '@shikijs/langs/css',
        '@shikijs/langs/html',
        '@shikijs/langs/json',
        '@shikijs/langs/svelte',
        '@shikijs/langs/toml',
        '@shikijs/langs/typescript',
        '@shikijs/langs/vue',
        '@shikijs/langs/yaml',
        '@shikijs/themes/vitesse-dark',
        '@shikijs/themes/vitesse-light',
      ],
    },
    resolve: {
      alias: {
        path: 'pathe',
      },
    },
    server: {
      cors: true,
    },
  },
})
```

Keep the existing `components`, `devtools`, `experimental`, `imports`, `nitro`, and `umami` sections unchanged unless TypeScript requires a local ordering change.

- [ ] **Step 4: Add shadcn-vue configuration**

Create `components.json`:

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "app/assets/css/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "composables": "@/composables"
  },
  "iconLibrary": "lucide"
}
```

Expected:

- shadcn-vue CLI can resolve UI output to `app/components/ui`.

- [ ] **Step 5: Add Tailwind CSS and shadcn theme variables**

Create `app/assets/css/tailwind.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  color-scheme: light;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.705 0.173 70.67);
  --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.705 0.173 70.67);
  --radius: 0.5rem;
}

.dark {
  color-scheme: dark;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.78 0.157 75.1);
  --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.78 0.157 75.1);
}

@layer base {
  * {
    border-color: var(--border);
  }

  html,
  body,
  #__nuxt {
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  body {
    background: var(--background);
    color: var(--foreground);
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar:horizontal {
  height: 6px;
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

::-webkit-scrollbar-track {
  background-color: var(--border);
  border-radius: 1px;
}

::-webkit-scrollbar-thumb {
  background-color: color-mix(in oklch, var(--foreground) 20%, transparent);
  border-radius: 1px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in oklch, var(--foreground) 45%, transparent);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2147483646;
}

.dark::view-transition-old(root) {
  z-index: 2147483646;
}

.dark::view-transition-new(root) {
  z-index: 1;
}
```

- [ ] **Step 6: Add shadcn utility helper**

Create `app/lib/utils.ts`:

```ts
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 7: Generate required shadcn-vue components**

Run:

```bash
rtk pnpm dlx shadcn-vue@latest add button dropdown-menu tooltip
```

Expected:

- shadcn-vue component files are created under `app/components/ui`.
- Generated files import `cn` from `@/lib/utils` or an equivalent alias that resolves in this Nuxt app.

- [ ] **Step 8: Verify Nuxt can prepare after config changes**

Run:

```bash
rtk pnpm postinstall
```

Expected:

- Nuxt prepare completes.
- If alias resolution fails for generated shadcn-vue files, update `components.json` and generated imports so they use the same alias style consistently.

- [ ] **Step 9: Commit foundation changes**

Run:

```bash
rtk proxy git add package.json pnpm-lock.yaml nuxt.config.ts components.json app/assets/css/tailwind.css app/lib/utils.ts app/components/ui
rtk proxy git commit -m "chore: add shadcn vue tailwind foundation"
```

Expected:

- Commit succeeds.

## Task 2: Replace Toolbar Controls With shadcn-vue

**Files:**

- Modify: `app/components/navbar/Navbar.vue`
- Modify: `app/components/navbar/LanguageSelect.vue`
- Modify: `app/components/atomic/DarkToggle.vue`

- [ ] **Step 1: Inspect generated component exports**

Run:

```bash
rtk rg -n "export|defineProps|TooltipProvider|DropdownMenu" app/components/ui
```

Expected:

- Confirm exact export names for `Button`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `Tooltip`, `TooltipContent`, `TooltipProvider`, and `TooltipTrigger`.

- [ ] **Step 2: Replace `LanguageSelect.vue`**

Rewrite `app/components/navbar/LanguageSelect.vue` to this structure, adjusting import paths only if generated shadcn files differ:

```vue
<script lang="ts" setup>
import type { Language } from '#imports'

function changeLanguage(language: Language) {
  currentLanguageId.value = language
}
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
      <DropdownMenuItem
        @select="changeLanguage(id)"
        v-for="(lang, id) in LANGUAGES"
        :key="id"
        class="gap-2"
      >
        <span
          :class="lang.icon"
          aria-hidden="true"
          class="size-4"
        />
        <span class="flex-1">{{ lang.label }}</span>
        <span
          v-if="currentLanguageId === id"
          aria-hidden="true"
          class="i-lucide:check size-4"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

- [ ] **Step 3: Replace `DarkToggle.vue` rendering**

Keep the existing script logic in `app/components/atomic/DarkToggle.vue`. Replace only the template with:

```vue
<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          @click="toggleDark"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          size="icon"
          type="button"
          variant="ghost"
          class="size-8"
        >
          <span
            aria-hidden="true"
            class="i-lucide:sun dark:i-lucide:moon size-4"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {{ isDark ? 'Switch to light mode' : 'Switch to dark mode' }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
```

- [ ] **Step 4: Replace `Navbar.vue` toolbar actions**

Rewrite `app/components/navbar/Navbar.vue`:

```vue
<script lang="ts" setup>
import { META } from '~/constants'
import { repository, version } from '../../../package.json'
</script>

<template>
  <header
    class="bg-background flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
  >
    <div
      class="min-w-0 flex flex-wrap items-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-start"
    >
      <div class="mr-4 min-w-0 flex items-baseline gap-1.5">
        <h1 class="truncate text-lg font-semibold tracking-normal">
          {{ META.appName }}
        </h1>
        <small class="text-muted-foreground shrink-0 text-xs">{{
          `v${version}`
        }}</small>
      </div>
      <LanguageSelect />
    </div>

    <div
      class="min-w-0 flex items-center gap-3 max-sm:w-full max-sm:justify-between"
    >
      <div class="min-w-0 flex items-center gap-3 text-sm">
        <span class="text-muted-foreground shrink-0"
          >{{ +parseCost.toFixed(1) }} ms</span
        >
        <a
          :href="`https://www.npmjs.com/package/${currentParser.pkgName}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground truncate font-mono underline-offset-4 hover:underline"
        >
          {{ currentParser.pkgName }}
        </a>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                class="size-8"
                as-child
              >
                <NuxtLink
                  :aria-label="currentParser.label"
                  :to="currentParser.link"
                  target="_blank"
                >
                  <span
                    aria-hidden="true"
                    class="i-lucide:book-open size-4"
                  />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{{ currentParser.label }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
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
                  aria-label="GitHub"
                  target="_blank"
                >
                  <span
                    aria-hidden="true"
                    class="i-lucide:github size-4"
                  />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent>GitHub</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DarkToggle />
      </div>
    </div>
  </header>
</template>
```

- [ ] **Step 5: Run focused checks**

Run:

```bash
rtk pnpm lint app/components/navbar/Navbar.vue app/components/navbar/LanguageSelect.vue app/components/atomic/DarkToggle.vue
rtk pnpm typecheck
```

Expected:

- Lint and typecheck pass.
- If auto-imported shadcn components are not recognized by typecheck, run `rtk pnpm postinstall` and rerun typecheck.

- [ ] **Step 6: Commit toolbar changes**

Run:

```bash
rtk proxy git add app/components/navbar/Navbar.vue app/components/navbar/LanguageSelect.vue app/components/atomic/DarkToggle.vue .nuxt/components.d.ts .nuxt/imports.d.ts
rtk proxy git commit -m "refactor: migrate toolbar controls to shadcn vue"
```

Expected:

- Commit succeeds. If `.nuxt` files are ignored, omit them from `git add`.

## Task 3: Rewrite Layout, Loading, Output, And Editor Classes

**Files:**

- Modify: `app/app.vue`
- Modify: `app/components/InputContainer.vue`
- Modify: `app/components/Output/OutputContainer.vue`
- Modify: `app/components/Output/OutputJson.vue`
- Modify: `app/components/CodeEditor/index.vue`
- Modify: `app/components/atomic/Loading.vue`

- [ ] **Step 1: Rewrite `app/app.vue` classes**

Replace the template classes with Tailwind-compatible equivalents:

```vue
<template>
  <ClientOnly>
    <Suspense>
      <main
        class="bg-background text-foreground relative min-h-screen flex flex-col lg:h-screen"
      >
        <Navbar />

        <div class="min-h-0 flex flex-1 flex-col gap-2 p-2 lg:flex-row">
          <div class="min-w-0 flex flex-1 flex-col gap-2 lg:flex-row">
            <InputContainer
              v-if="showInputContainer"
              class="min-w-0 flex-1"
            />
            <OutputContainer
              v-if="showOutputContainer"
              class="min-w-0 flex-1"
            />
          </div>
        </div>
      </main>

      <template #fallback>
        <div class="bg-background relative h-screen">
          <Loading />
        </div>
      </template>
    </Suspense>
  </ClientOnly>
</template>
```

- [ ] **Step 2: Rewrite `InputContainer.vue` classes**

Use a framed pane around Monaco:

```vue
<template>
  <section
    class="bg-card relative min-h-[50vh] overflow-hidden border rounded-lg lg:min-h-0"
  >
    <CodeEditor
      v-model="code"
      :language
      class="h-full w-full"
    />
  </section>
</template>
```

Keep the existing script unchanged.

- [ ] **Step 3: Rewrite `OutputContainer.vue`**

Replace the template with:

```vue
<template>
  <section
    class="bg-card min-h-[50vh] flex flex-col overflow-hidden border rounded-lg lg:min-h-0"
  >
    <div class="min-h-0 min-w-0 flex flex-1">
      <div
        v-if="loading === 'load'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <span
          aria-hidden="true"
          class="i-lucide:loader-circle size-4 animate-spin"
        />
        <span>Loading parser...</span>
      </div>
      <div
        v-else-if="loading === 'parse'"
        class="text-muted-foreground h-full w-full flex items-center justify-center gap-2 text-sm"
      >
        <span
          aria-hidden="true"
          class="i-lucide:loader-circle size-4 animate-spin"
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
        <OutputJson class="h-full min-h-[50vh] w-full lg:min-h-0" />
      </div>
    </div>
  </section>
</template>
```

Keep the existing script unchanged.

- [ ] **Step 4: Rewrite `OutputJson.vue` highlight class**

Change the decoration class from Uno syntax:

```ts
className: `important-bg-yellow-400 important-bg-opacity-30`,
```

to a local class:

```ts
className: 'ast-highlight-range',
```

Add this class to `app/assets/css/tailwind.css`:

```css
.ast-highlight-range {
  background-color: color-mix(
    in oklch,
    var(--primary) 30%,
    transparent
  ) !important;
}
```

- [ ] **Step 5: Rewrite `CodeEditor/index.vue` loading fallback**

Replace the fallback content with Tailwind-compatible classes:

```vue
<div
  class="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground"
>
  <span
    aria-hidden="true"
    class="i-lucide:loader-circle size-8 animate-spin"
  />
  <span class="text-sm">Loading...</span>
</div>
```

- [ ] **Step 6: Rewrite `Loading.vue`**

Replace the template with:

```vue
<template>
  <div
    class="text-muted-foreground relative h-full w-full flex items-center justify-center"
  >
    <span
      aria-hidden="true"
      class="i-lucide:loader-circle size-6 animate-spin"
    />
  </div>
</template>
```

- [ ] **Step 7: Run focused checks**

Run:

```bash
rtk rg -n "lg:\\(|max-sm:\\(|op-|wh-full|flex-center|important-bg|text-#|bg-#|color-" app/app.vue app/components
rtk pnpm lint app/app.vue app/components/InputContainer.vue app/components/Output/OutputContainer.vue app/components/Output/OutputJson.vue app/components/CodeEditor/index.vue app/components/atomic/Loading.vue
rtk pnpm typecheck
```

Expected:

- `rg` prints no matches for removed UnoCSS syntax in the touched files.
- Lint and typecheck pass.

- [ ] **Step 8: Commit pane and status changes**

Run:

```bash
rtk proxy git add app/app.vue app/components/InputContainer.vue app/components/Output/OutputContainer.vue app/components/Output/OutputJson.vue app/components/CodeEditor/index.vue app/components/atomic/Loading.vue app/assets/css/tailwind.css
rtk proxy git commit -m "refactor: migrate editor panes to tailwind"
```

Expected:

- Commit succeeds.

## Task 4: Remove Old UI System And Fix Icon Strategy

**Files:**

- Delete: `uno.config.ts`
- Delete: `app/styles/vars.css`
- Delete: `app/styles/global.css` if empty after migration
- Delete: `app/plugins/1.floating-vue.ts`
- Delete: `app/components/DropdownItem.vue`
- Delete: `app/components/atomic/IconButton.vue`
- Delete: `app/components/atomic/IconToggle.vue`
- Delete: `app/components/atomic/ToggleButton.vue`
- Delete: `app/components/atomic/SimpleButton.vue`
- Delete: `app/components/atomic/ActionButton.vue`
- Modify parser icon constants if Tailwind cannot render existing icon utility strings.

- [ ] **Step 1: Search for old system usage**

Run:

```bash
rtk rg -n "@unocss|unocss|floating-vue|VMenu|VDropdown|v-tooltip|DropdownItem|IconButton|IconToggle|ToggleButton|SimpleButton|ActionButton|vars.css|global.css|flex-center|wh-full|op-|max-sm:\\(|lg:\\(" .
```

Expected:

- Matches show only files planned for deletion or lines that still need conversion.

- [ ] **Step 2: Delete old files**

Run:

```bash
rtk rm -f uno.config.ts app/styles/vars.css app/plugins/1.floating-vue.ts app/components/DropdownItem.vue app/components/atomic/IconButton.vue app/components/atomic/IconToggle.vue app/components/atomic/ToggleButton.vue app/components/atomic/SimpleButton.vue app/components/atomic/ActionButton.vue
```

If `app/styles/global.css` has no remaining imports in `nuxt.config.ts`, delete it too:

```bash
rtk rm -f app/styles/global.css
```

- [ ] **Step 3: Resolve icon rendering without UnoCSS**

Run:

```bash
rtk rg -n "i-[a-z0-9-]+:" app
```

Expected:

- If Tailwind/shadcn setup does not provide icon utility classes, replace UI control icons with `lucide-vue-next` component imports.
- Parser file-type icons can temporarily remain as plain spans only if the generated CSS still renders them. If they no longer render, replace the selector UI icons with text initials or lucide `FileCode2` for every language in the dropdown.

Preferred fallback for `LanguageSelect.vue` if file-type icons stop rendering:

```vue
<span
  aria-hidden="true"
  class="flex size-5 items-center justify-center rounded border bg-muted text-[10px] font-semibold uppercase text-muted-foreground"
>
  {{ lang.label.slice(0, 2) }}
</span>
```

- [ ] **Step 4: Run global old-system search**

Run:

```bash
rtk rg -n "@unocss|unocss|floating-vue|VMenu|VDropdown|v-tooltip|DropdownItem|IconButton|IconToggle|ToggleButton|SimpleButton|ActionButton|--uno|flex-center|wh-full|op-|max-sm:\\(|lg:\\(|important-bg|text-#|bg-#|color-" .
```

Expected:

- No matches except historical text in `docs/superpowers/specs` and `docs/superpowers/plans`.

- [ ] **Step 5: Run full checks**

Run:

```bash
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm build
```

Expected:

- All commands pass.

- [ ] **Step 6: Commit removal**

Run:

```bash
rtk proxy git add -A
rtk proxy git commit -m "refactor: remove unocss and floating vue"
```

Expected:

- Commit succeeds.

## Task 5: Manual Runtime Verification

**Files:**

- Modify only if runtime verification exposes a migration bug.

- [ ] **Step 1: Start dev server**

Run:

```bash
rtk pnpm dev
```

Expected:

- Nuxt dev server starts and prints a local URL, usually `http://localhost:3000/`.

- [ ] **Step 2: Verify app behavior manually**

Check these flows:

- Home page renders without console/runtime errors.
- Language dropdown opens.
- Selecting another language updates the editor template and parser package name.
- Dark-mode toggle switches the theme and keeps the view-transition behavior.
- Parser loading and parsing states still show.
- AST JSON output appears after parsing.
- Parser error output appears as readable monospace text when invalid input is entered.
- Parser documentation link opens the current parser docs.
- GitHub link opens the repository.

- [ ] **Step 3: Stop dev server**

Stop the server with `Ctrl-C`.

- [ ] **Step 4: Apply runtime fixes if needed**

If runtime verification finds a bug, make the smallest targeted fix in the relevant file and rerun:

```bash
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm build
```

Expected:

- All commands pass after the fix.

- [ ] **Step 5: Commit runtime fixes**

If changes were required:

```bash
rtk proxy git add -A
rtk proxy git commit -m "fix: stabilize shadcn vue migration"
```

Expected:

- Commit succeeds.

If no changes were required, do not create an empty commit.

## Final Verification

- [ ] Run:

```bash
rtk proxy git status --short
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm build
```

- [ ] Expected:
  - `git status --short` is clean or contains only intentionally uncommitted local changes requested by the user.
  - `pnpm lint` passes.
  - `pnpm typecheck` passes.
  - `pnpm build` passes.

## Self-Review Notes

- Spec coverage: Tasks cover dependency/config migration, shadcn component generation, replacement of atomic controls, DropdownMenu and Tooltip migration, Tailwind class rewrites, old system deletion, and runtime verification.
- Type consistency: State names match the existing composables: `currentLanguageId`, `currentLanguage`, `LANGUAGES`, `parseCost`, `currentParser`, `loading`, and `error`.
- Scope: Monaco, parser behavior, storage, and state ownership remain unchanged.
