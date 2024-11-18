import FloatingVue from 'floating-vue'

export default defineNuxtPlugin({
  name: 'floating-vue',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(FloatingVue, {
      overflowPadding: 10,
    })
  },
})

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    VMenu: typeof import('floating-vue').Menu
    VDropdown: typeof import('floating-vue').Dropdown
  }
}
