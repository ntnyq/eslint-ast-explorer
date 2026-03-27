/**
 * @file Nuxt config
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 */

import process from 'node:process'

const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: ['@vueuse/nuxt', '@unocss/nuxt', 'nuxt-monaco-editor', 'nuxt-umami'],

  ssr: !isProduction,

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

  devtools: {
    enabled: false,
  },

  experimental: {
    appManifest: false,
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
    viteEnvironmentApi: false,
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
    preset: isProduction ? 'static' : undefined,
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    routeRules: isProduction
      ? {
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
        }
      : {},
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

    optimizeDeps: {
      include: [
        'floating-vue',
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
