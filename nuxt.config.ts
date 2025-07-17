/**
 * @file Nuxt config
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 */

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', '@unocss/nuxt', 'nuxt-monaco-editor', 'nuxt-umami'],

  ssr: false,

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
    appManifest: false,
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  imports: {
    addons: {
      vueTemplate: true,
    },
    dirs: [
      './composables',
      './composables/state',
      './composables/parser',
      './utils',
    ],
  },

  nitro: {
    preset: 'static',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    routeRules: {
      '/': {
        prerender: true,
      },
      '/*': {
        prerender: false,
      },
      '/200.html': {
        prerender: true,
      },
      '/404.html': {
        prerender: true,
      },
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
