<script lang="ts" setup>
import { ChevronRight } from '@lucide/vue'
import { formatPrimitiveForAstTree } from '~/utils/ast-tree-index'
import type { AstTreeIndex } from '~/utils/ast-tree-index'

const props = withDefaults(
  defineProps<{
    id?: string | number
    value: unknown
    treeIndex: AstTreeIndex
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

const primitivePreview = computed(() => formatPrimitiveForAstTree(props.value))
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

const selfFocusing = computed(() => props.treeIndex.containsCursor(props.value))
const childFocusing = computed(() =>
  props.treeIndex.childContainsCursor(props.value),
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
  return props.treeIndex.matchesSearch(props.value, keyLabel.value)
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
        :tree-index
        :ancestors="nextAncestors"
        :id="key"
      />
    </div>
  </div>
</template>
