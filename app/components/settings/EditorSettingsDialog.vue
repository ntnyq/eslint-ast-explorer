<script lang="ts" setup>
import { Code2, RotateCcw } from '@lucide/vue'
import json5 from 'json5'
import type { EditorSettings } from '~/composables/state/editor'

const open = computed({
  get: () => showEditorSettingsDialog.value,
  set: value => {
    showEditorSettingsDialog.value = value
  },
})

const rawSettings = shallowRef('')
const rawError = shallowRef<string>()

const fontSize = computed({
  get: () => Number(editorSettings.value.fontSize || 14),
  set: value => {
    setEditorSettings({ fontSize: Number(value) })
  },
})
const tabSize = computed({
  get: () => Number(editorSettings.value.tabSize || 2),
  set: value => {
    setEditorSettings({ tabSize: Number(value) })
  },
})
const wordWrap = computed({
  get: () => String(editorSettings.value.wordWrap || 'off'),
  set: value => {
    setEditorSettings({ wordWrap: value as EditorSettings['wordWrap'] })
  },
})
const lineNumbers = computed({
  get: () => String(editorSettings.value.lineNumbers || 'on'),
  set: value => {
    setEditorSettings({
      lineNumbers: value as EditorSettings['lineNumbers'],
    })
  },
})
const minimapEnabled = computed({
  get: () => !!editorSettings.value.minimap?.enabled,
  set: value => {
    setEditorSettings({
      minimap: {
        ...editorSettings.value.minimap,
        enabled: value,
      },
    })
  },
})
const fontLigatures = computed({
  get: () => !!editorSettings.value.fontLigatures,
  set: value => {
    setEditorSettings({ fontLigatures: value })
  },
})

watch(
  open,
  () => {
    rawSettings.value = JSON.stringify(editorSettings.value, null, 2)
    rawError.value = undefined
  },
  {
    immediate: true,
  },
)

function setEditorSettings(value: Partial<EditorSettings>) {
  editorSettings.value = {
    ...editorSettings.value,
    ...value,
  }
  rawSettings.value = JSON.stringify(editorSettings.value, null, 2)
}

function applyRawSettings() {
  try {
    editorSettings.value = json5.parse(rawSettings.value)
    rawError.value = undefined
  } catch (err) {
    rawError.value = err instanceof Error ? err.message : String(err)
  }
}

function resetSettings() {
  editorSettings.value = {
    fontSize: 14,
    fontLigatures: true,
    lineNumbers: 'on',
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    wordWrap: 'off',
  }
  rawSettings.value = JSON.stringify(editorSettings.value, null, 2)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Code2
            aria-hidden="true"
            class="size-5"
          />
          Editor Settings
        </DialogTitle>
        <DialogDescription>Monaco</DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="editor-font-size">Font size</Label>
            <Input
              v-model="fontSize"
              id="editor-font-size"
              type="number"
              min="10"
              max="28"
            />
          </div>
          <div class="grid gap-2">
            <Label for="editor-tab-size">Tab size</Label>
            <Input
              v-model="tabSize"
              id="editor-tab-size"
              type="number"
              min="1"
              max="8"
            />
          </div>
          <div class="grid gap-2">
            <Label>Word wrap</Label>
            <Select v-model="wordWrap">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">off</SelectItem>
                <SelectItem value="on">on</SelectItem>
                <SelectItem value="wordWrapColumn">wordWrapColumn</SelectItem>
                <SelectItem value="bounded">bounded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label>Line numbers</Label>
            <Select v-model="lineNumbers">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">on</SelectItem>
                <SelectItem value="off">off</SelectItem>
                <SelectItem value="relative">relative</SelectItem>
                <SelectItem value="interval">interval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label
            class="bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <span class="text-sm font-medium">Minimap</span>
            <Switch v-model:checked="minimapEnabled" />
          </label>
          <label
            class="bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <span class="text-sm font-medium">Ligatures</span>
            <Switch v-model:checked="fontLigatures" />
          </label>
        </div>

        <Textarea
          v-model="rawSettings"
          class="max-h-[32vh] min-h-52 resize-none font-mono text-sm"
          spellcheck="false"
        />
        <p
          v-if="rawError"
          class="text-destructive text-sm"
        >
          {{ rawError }}
        </p>
      </div>

      <DialogFooter>
        <Button
          @click="resetSettings"
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
          @click="applyRawSettings"
          type="button"
        >
          Apply JSON
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
