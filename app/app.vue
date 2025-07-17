<script lang="ts" setup>
import { META } from '~/constants'

const title = META.appName
const description = META.appDescription
const url = META.appUrl

// const ogImage = {
//   url: '/og.png',
//   width: 2560,
//   height: 1280,
//   type: 'image/png',
// } as const

if (import.meta.server) {
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    // ogImage,
    ogUrl: url,
    twitterTitle: title,
    twitterDescription: description,
    // twitterImage: ogImage,
    // twitterCard: 'summary_large_image',
    viewport: 'width=device-width, initial-scale=1',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
  })

  useHeadSafe({
    htmlAttrs: {
      lang: 'en',
    },
    link: [
      //
      { href: '/icon_48.png', rel: 'icon', type: 'image/png' },
    ],
  })
}
</script>

<template>
  <ClientOnly>
    <Suspense>
      <main class="relative flex flex-col lg:h-screen">
        <Navbar class="border-b" />

        <div class="min-h-0 flex flex-1 flex-col gap-2 lg:flex-row">
          <div class="min-w-0 flex flex-col gap-2 lg:(flex-1 flex-row)">
            <InputContainer
              v-if="showInputContainer"
              class="min-w-0 flex-1 py-1"
            />
            <OutputContainer
              v-if="showOutputContainer"
              class="min-w-0 flex-1 py-1"
            />
          </div>
        </div>
      </main>

      <template #fallback>
        <div class="relative h-screen">
          <Loading />
        </div>
      </template>
    </Suspense>
  </ClientOnly>
</template>
