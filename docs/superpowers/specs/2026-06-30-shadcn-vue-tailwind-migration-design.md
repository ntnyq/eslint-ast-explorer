# shadcn-vue Tailwind Migration Design

Date: 2026-06-30

## Goal

Migrate the Nuxt app from UnoCSS and custom atomic UI controls to Tailwind CSS and shadcn-vue, following the shadcn-vue Nuxt installation flow. Components that have a clear shadcn-vue equivalent should use that equivalent.

The app should keep its current product shape: a compact tool interface with a top toolbar, language selector, code editor, AST output panel, parser status, documentation links, GitHub link, and dark-mode toggle.

## Non-Goals

- Do not redesign the parser workflow or AST data model.
- Do not replace Monaco Editor.
- Do not change parser loading, parsing, serialization, or storage behavior except where UI wiring requires it.
- Do not add a new state management library.

## Architecture

The Nuxt 4 structure remains intact:

- `app/app.vue` stays the composition surface for the tool layout.
- `app/components/navbar/Navbar.vue` owns the top toolbar.
- `app/components/navbar/LanguageSelect.vue` owns language selection.
- `app/components/InputContainer.vue` owns the editable Monaco pane.
- `app/components/Output/OutputContainer.vue` owns output status and AST display.
- `app/components/Output/OutputJson.vue` and `app/components/CodeEditor/index.vue` keep Monaco-specific logic.

The styling system changes from UnoCSS to Tailwind CSS. shadcn-vue generated components live under the project component tree and are consumed directly where they replace local atoms.

## Dependency And Config Changes

- Add Tailwind CSS support required by shadcn-vue for Nuxt.
- Add `shadcn-nuxt` and configure it in `nuxt.config.ts`.
- Add shadcn-vue configuration files generated or required by the installation flow.
- Remove `@unocss/nuxt`, `@unocss/reset`, and `uno.config.ts`.
- Remove `floating-vue`, its Nuxt plugin, and its stylesheet import.
- Keep existing Nuxt modules that serve app behavior: VueUse, Monaco, and Umami.

## Component Replacement Plan

- Replace `IconButton`, `SimpleButton`, `ActionButton`, `IconToggle`, and `ToggleButton` usage with shadcn-vue `Button` variants and sizes.
- Replace `LanguageSelect`, `DropdownItem`, and `VMenu` usage with shadcn-vue `DropdownMenu`.
- Replace Floating Vue tooltip usage with shadcn-vue `Tooltip`.
- Keep `DarkToggle` behavior, including the view-transition animation, but render it with shadcn-vue `Button` and `Tooltip`.
- Use shadcn-vue-compatible loading and error UI in `OutputContainer`; keep parser status messages concise.
- Preserve parser language icons as plain icon spans if no shadcn-vue component is responsible for them.

## Styling Direction

This is a dense developer tool, so the visual language should be quiet and operational:

- Use a full-height app shell with a compact toolbar.
- Use pane borders and background colors from shadcn/Tailwind theme tokens.
- Keep controls visually consistent through shadcn-vue variants instead of custom button classes.
- Preserve light and dark modes.
- Avoid marketing-page layout, oversized hero typography, decorative cards, and unrelated visual flourishes.

All UnoCSS syntax must be rewritten to valid Tailwind CSS or local CSS. This includes grouped variants such as `lg:(...)`, opacity shortcuts such as `op-70`, arbitrary color shortcuts such as `text-#888`, icon utility classes where Tailwind cannot provide them, and project shortcuts such as `flex-center` and `wh-full`.

## Data Flow

The migration should not change app state ownership:

- Language selection still writes to `currentLanguageId`.
- Dark mode still writes to `isDark`.
- Parser status still reads `loading`, `error`, `parseCost`, and `currentParser`.
- Editor and output panes still read and write existing composable state.

shadcn-vue components should be used as presentational components around the same state and events.

## Error Handling

Existing parser errors remain visible in the output pane. The new UI should:

- Preserve stack or message output from `errorString`.
- Use readable error colors in both light and dark mode.
- Avoid hiding Monaco output while a parser error is active.

## Testing And Verification

The implementation is complete when these pass:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Manual verification should confirm:

- The home page renders without runtime errors.
- The language dropdown opens and changes the current language.
- The dark-mode toggle switches themes.
- Parser loading, parsing, output, and error states still appear.
- Documentation and GitHub links still navigate correctly.

## Implementation Notes

Prefer direct shadcn-vue usage over preserving local atomic wrappers. A wrapper is acceptable only when it protects existing behavior that is not provided by shadcn-vue, such as the dark-mode view-transition animation.

Keep changes scoped to the migration. Avoid unrelated parser, Monaco, release, or project-structure refactors.
