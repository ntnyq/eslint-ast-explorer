/**
 * @file Nuxt config
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 */

import { META } from './constants'

export default defineNuxtConfig({
  compatibilityDate: '2025-02-06',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', '@unocss/nuxt', 'nuxt-monaco-editor', 'nuxt-umami'],

  ssr: false,

  app: {
    head: {
      link: [{ href: '/icon_48.png', rel: 'icon', type: 'image/png' }],
      title: META.appName,
      viewport: 'width=device-width,initial-scale=1',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { content: 'width=device-width, initial-scale=1', name: 'viewport' },
        { content: META.appDescription, name: 'description' },
        { content: 'black-translucent', name: 'apple-mobile-web-app-status-bar-style' },
      ],
    },
  },

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
    transform: {
      include: [/\.vue/, /\.md/],
    },
  },

  css: [
    '@unocss/reset/tailwind.css',
    'floating-vue/dist/style.css',
    '~/styles/vars.css',
    '~/styles/global.css',
  ],

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  imports: {
    dirs: ['./composables', './composables/state', './composables/parser', './utils'],
    addons: {
      vueTemplate: true,
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },

  umami: {
    autoTrack: false,
    enabled: true,
    host: 'https://api-gateway.umami.dev',
    id: 'beb3e0d7-9081-456f-babc-430e9604a7ce',
    ignoreLocalhost: true,
  },

  vite: {
    esbuild: {
      legalComments: 'external',
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
