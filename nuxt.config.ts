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

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ href: '/icon_48.png', rel: 'icon', type: 'image/png' }],
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
      exclude: ['@astrojs/compiler-binding-wasm32-wasi'],
      include: [
        '@lucide/vue',
        '@shikijs/core',
        '@shikijs/engine-javascript',
        '@shikijs/langs/astro',
        '@shikijs/langs/css',
        '@shikijs/langs/html',
        '@shikijs/langs/json',
        '@shikijs/langs/javascript',
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
        'json-to-ast', // CJS
        'json5',
        'reka-ui',
        'tailwind-merge',
      ],
    },

    resolve: {
      alias: {
        '@astrojs/compiler-binding': '@astrojs/compiler-binding-wasm32-wasi',
        path: 'pathe',
      },
    },

    server: {
      cors: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
  },
})
