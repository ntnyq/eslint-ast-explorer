import { configureMonacoDefaults } from '~/utils/monaco'

export default defineNuxtPlugin(() => {
  useMonaco()?.then(configureMonacoDefaults)
})
