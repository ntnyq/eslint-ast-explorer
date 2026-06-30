/**
 * @file Nuxt config
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 */

import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2026-06-30',

  css: ['~/assets/css/tailwind.css'],

  modules: ['@vueuse/nuxt', 'nuxt-monaco-editor', 'nuxt-umami', 'shadcn-nuxt'],

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

  shadcn: {
    componentDir: './app/components/ui',
    prefix: '',
  },

  umami: {
    autoTrack: false,
    enabled: true,
    host: 'https://api-gateway.umami.dev',
    id: 'beb3e0d7-9081-456f-babc-430e9604a7ce',
    ignoreLocalhost: true,
  },

  vite: {
    plugins: [tailwindcss()],

    esbuild: {
      legalComments: 'external',
    },

    optimizeDeps: {
      include: [
        '@shikijs/core',
        '@shikijs/engine-javascript',
        '@shikijs/langs/astro',
        '@shikijs/langs/css',
        '@shikijs/langs/html',
        '@shikijs/langs/json',
        '@shikijs/langs/svelte',
        '@shikijs/langs/toml',
        '@shikijs/langs/typescript',
        '@shikijs/langs/vue',
        '@shikijs/langs/yaml',
        '@shikijs/monaco',
        '@shikijs/themes/dark-plus',
        '@shikijs/themes/light-plus',
        '@shikijs/themes/vitesse-dark',
        '@shikijs/themes/vitesse-light',
        'class-variance-authority',
        'clsx',
        'json5',
        '@lucide/vue',
        'reka-ui',
        'tailwind-merge',
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
