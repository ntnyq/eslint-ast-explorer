import { initParserOptionsState } from '~/composables/state/options'
import { initParserModule } from '~/composables/state/parser'

export default defineNuxtPlugin({
  hooks: {
    'app:beforeMount': () => {
      initParserOptionsState()
      initParserModule()
    },
  },
})
