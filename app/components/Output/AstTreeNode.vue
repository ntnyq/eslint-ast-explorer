<script lang="ts" setup>
import { ChevronRight } from '@lucide/vue'
import type { LocRange } from '~/composables/location'

const props = withDefaults(
  defineProps<{
    id?: string | number
    value: unknown
    root?: boolean
    open?: boolean
    ancestors?: unknown[]
  }>(),
  {
    ancestors: () => [],
  },
)

const searchQuery = computed(() => outputSearch.value.trim().toLowerCase())
const isObject = computed(
  () => props.value !== null && typeof props.value === 'object',
)
const isCircular = computed(
  () => isObject.value && props.ancestors.includes(props.value),
)
const ownRange = computed(() => getRange(props.value))

const entries = computed<[string | number, unknown][]>(() => {
  if (!isObject.value || isCircular.value) {
    return []
  }

  if (Array.isArray(props.value)) {
    return props.value
      .map((value, index) => [index, value] as [number, unknown])
      .filter(([key, value]) => !shouldHideKey(key, true, value))
  }

  return Object.entries(props.value as Record<string, unknown>).filter(
    ([key, value]) => !shouldHideKey(key, true, value),
  )
})

const nodeTitle = computed(() => {
  const value = props.value as Record<string, unknown> | null
  if (!value || typeof value !== 'object') {
    return
  }

  if (typeof currentParser.value.nodeTitle === 'function') {
    return currentParser.value.nodeTitle.call(undefined, props.value)
  }

  const titleKey = currentParser.value.nodeTitle || 'type'
  const title = value[titleKey]
  return typeof title === 'string' ? title : undefined
})

const primitivePreview = computed(() => formatPrimitive(props.value))
const summary = computed(() => {
  if (isCircular.value) {
    return '(circular)'
  }
  if (Array.isArray(props.value)) {
    return `Array(${props.value.length})`
  }
  if (isObject.value) {
    return `{ ${entries.value.length} keys }`
  }
  return primitivePreview.value
})

const openable = computed(() => entries.value.length > 0)
const keyLabel = computed(() =>
  props.id == null ? undefined : String(props.id),
)
const nextAncestors = computed(() =>
  isObject.value ? [...props.ancestors, props.value] : props.ancestors,
)

const selfFocusing = computed(() => containsCursor(ownRange.value))
const childFocusing = computed(() =>
  entries.value.some(([, value]) =>
    subtreeContainsCursor(value, nextAncestors.value),
  ),
)
const isFocusing = computed(() => selfFocusing.value || childFocusing.value)
const exactFocusing = computed(() => selfFocusing.value && !childFocusing.value)

const openManual = shallowRef<boolean>()
const isOpen = computed(
  () =>
    openable.value &&
    (openManual.value ??
      (props.open ||
        !!searchQuery.value ||
        (autoFocus.value && isFocusing.value))),
)

const isVisible = computed(() => {
  if (shouldHideKey(props.id, true, props.value)) {
    return false
  }
  if (!searchQuery.value) {
    return true
  }
  return subtreeMatches(props.value, keyLabel.value, searchQuery.value)
})

const treeNodeRef = useTemplateRef<HTMLElement>('treeNodeRef')

watch(
  [autoFocus, exactFocusing, treeNodeRef],
  ([enabled, exact, element]) => {
    if (enabled && exact && element) {
      requestAnimationFrame(() => element.scrollIntoView({ block: 'center' }))
    }
  },
  {
    immediate: true,
    flush: 'post',
  },
)

function toggleOpen() {
  if (!openable.value) {
    return
  }
  openManual.value = !isOpen.value
}

function handleMouseOver(event: MouseEvent) {
  const range = ownRange.value

  if (range) {
    event.stopPropagation()
    outputHoverRange.value = range
  } else if (props.root) {
    outputHoverRange.value = undefined
  }
}

function handleMouseLeave() {
  if (props.root) {
    outputHoverRange.value = undefined
  }
}

function containsCursor(range?: LocRange) {
  return (
    !!range && range[0] <= editorCursor.value && range[1] >= editorCursor.value
  )
}

function subtreeContainsCursor(
  value: unknown,
  ancestors: unknown[] = [],
): boolean {
  if (containsCursor(getRange(value))) {
    return true
  }
  if (!value || typeof value !== 'object') {
    return false
  }
  if (ancestors.includes(value)) {
    return false
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, childValue]) =>
      !shouldHideKey(key, true, childValue) &&
      subtreeContainsCursor(childValue, [...ancestors, value]),
  )
}

function subtreeMatches(
  value: unknown,
  key: string | undefined,
  query: string,
  ancestors: unknown[] = [],
): boolean {
  const haystack = [key, nodeTitleFor(value), formatPrimitive(value)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes(query)) {
    return true
  }
  if (!value || typeof value !== 'object' || ancestors.includes(value)) {
    return false
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([childKey, childValue]) =>
      !shouldHideKey(childKey, true, childValue) &&
      subtreeMatches(childValue, childKey, query, [...ancestors, value]),
  )
}

function nodeTitleFor(value: unknown) {
  if (!value || typeof value !== 'object') {
    return
  }
  const title = (value as Record<string, unknown>).type
  return typeof title === 'string' ? title : undefined
}

function formatPrimitive(value: unknown) {
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return 'undefined'
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'bigint') {
    return `${value}n`
  }
  if (typeof value === 'function') {
    return `function ${value.name || 'anonymous'}(...)`
  }
  if (isRegExp(value)) {
    return String(value)
  }
  return ''
}
</script>

<template>
  <div
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
    v-if="isVisible"
    ref="treeNodeRef"
    :class="exactFocusing && 'ast-highlight-range rounded-sm'"
    class="w-fit min-w-full font-mono text-sm leading-6"
  >
    <div class="flex min-h-6 items-center gap-1">
      <button
        @click="toggleOpen"
        v-if="openable"
        :aria-label="isOpen ? 'Collapse AST node' : 'Expand AST node'"
        type="button"
        class="text-muted-foreground hover:text-foreground size-5 flex shrink-0 items-center justify-center rounded"
      >
        <ChevronRight
          :class="isOpen && 'rotate-90'"
          aria-hidden="true"
          class="size-3.5 transition-transform"
        />
      </button>
      <span
        v-else
        aria-hidden="true"
        class="size-5 shrink-0"
      />

      <button
        @click="toggleOpen"
        v-if="openable"
        type="button"
        class="flex min-w-0 items-baseline gap-1 text-left"
      >
        <span
          v-if="keyLabel"
          class="text-primary font-semibold"
          >{{ keyLabel }}:</span
        >
        <span
          v-if="nodeTitle"
          class="text-foreground font-semibold"
          >{{ nodeTitle }}</span
        >
        <span class="text-muted-foreground">{{ summary }}</span>
      </button>

      <div
        v-else
        class="flex min-w-0 items-baseline gap-1"
      >
        <span
          v-if="keyLabel"
          class="text-primary font-semibold"
          >{{ keyLabel }}:</span
        >
        <span
          v-if="nodeTitle"
          class="text-foreground font-semibold"
          >{{ nodeTitle }}</span
        >
        <span class="text-muted-foreground break-all">{{ summary }}</span>
      </div>
    </div>

    <div
      v-if="openable && isOpen"
      class="border-border/70 ml-2.5 border-l pl-3"
    >
      <AstTreeNode
        v-for="[key, childValue] in entries"
        :key
        :value="childValue"
        :ancestors="nextAncestors"
        :id="key"
      />
    </div>
  </div>
</template>
