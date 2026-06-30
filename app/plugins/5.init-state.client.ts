import { initParserOptionsState } from '~/composables/state/options'
import { initParserModule } from '~/composables/state/parser'
import { initUrlState } from '~/composables/state/url'

export default defineNuxtPlugin({
  hooks: {
    'app:beforeMount': () => {
      initParserOptionsState()
      initUrlState()
      initParserModule()
    },
  },
})
