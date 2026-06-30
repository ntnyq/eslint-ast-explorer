<script lang="ts" setup>
import { GitBranch, RotateCcw } from '@lucide/vue'

const open = computed({
  get: () => showParserVersionDialog.value,
  set: value => {
    showParserVersionDialog.value = value
  },
})
const versionValue = shallowRef('')
const versionOverridable = computed(
  () => currentParser.value.versionOverridable !== false,
)
const packageUrl = computed(() =>
  isUrlVersion.value
    ? overrideVersion.value
    : `https://www.npmjs.com/package/${currentParser.value.pkgName}`,
)

watch(
  [open, overrideVersion],
  () => {
    versionValue.value = overrideVersion.value || ''
  },
  {
    immediate: true,
  },
)

function applyVersion() {
  setOverrideVersion(versionValue.value)
  open.value = false
}

function resetVersion() {
  versionValue.value = ''
  clearOverrideVersion()
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <GitBranch
            aria-hidden="true"
            class="size-5"
          />
          Parser Version
        </DialogTitle>
        <DialogDescription>{{ currentParser.pkgName }}</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="parser-version">Version</Label>
          <Input
            v-model="versionValue"
            :disabled="!versionOverridable"
            id="parser-version"
            class="font-mono"
            placeholder="latest, next, ^1.0.0, https://..."
          />
        </div>

        <div class="bg-muted/40 grid gap-2 rounded-md border p-3 text-sm">
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Current</span>
            <span class="font-mono">{{ displayVersion || '-' }}</span>
          </div>
          <p
            v-if="parserVersionError"
            class="text-destructive text-xs"
          >
            {{ parserVersionError }}
          </p>
          <a
            v-if="packageUrl"
            :href="packageUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-foreground truncate font-mono hover:underline"
          >
            {{ packageUrl }}
          </a>
        </div>
      </div>

      <DialogFooter>
        <Button
          @click="resetVersion"
          type="button"
          variant="outline"
        >
          <RotateCcw
            aria-hidden="true"
            class="size-4"
          />
          Reset
        </Button>
        <Button
          @click="applyVersion"
          :disabled="!versionOverridable"
          type="button"
        >
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
