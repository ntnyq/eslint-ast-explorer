<script lang="ts" setup>
defineProps<{
  type?: 'icon' | 'button'
}>()

const isDark = useDark()

const isViewTransitionSupported =
  typeof document !== 'undefined' &&
  !!document.startViewTransition &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function toggleDark(evt: MouseEvent) {
  if (!isViewTransitionSupported || !evt) {
    isDark.value = !isDark.value
    return
  }

  const { clientX: x, clientY: y } = evt
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-in',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          @click="toggleDark"
          :size="type === 'button' ? 'sm' : 'icon'"
          :class="type === 'button' ? 'h-8 gap-2 px-3' : 'size-8'"
          :title="isDark ? 'Dark Mode' : 'Light Mode'"
          :aria-label="isDark ? 'Dark Mode' : 'Light Mode'"
          type="button"
          variant="ghost"
        >
          <span
            aria-hidden="true"
            class="i-uil:sun dark:i-uil:moon size-4"
          />
          <span v-if="type === 'button'">
            {{ isDark ? 'Dark Mode' : 'Light Mode' }}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {{ isDark ? 'Dark Mode' : 'Light Mode' }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
