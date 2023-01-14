import { dim, green, yellow } from 'kolorist'
import { DEFAULT_INSPECTOR_OPTIONS } from 'vite-plugin-vue-inspector'
import type { Options } from './types'
import unplugin from '.'

export default (options: Options, nuxt: any) => {
  nuxt.hook('vite:extendConfig', async (config: any) => {
    config.plugins = config.plugins || []
    config.plugins.push(unplugin.vite({
      appendTo: 'entry.mjs',
      ...options,
    }))
  })
  let printed = false
  nuxt.hook('vite:serverCreated', () => {
    if (printed)
      return
    const normalizedOptions = { ...DEFAULT_INSPECTOR_OPTIONS, ...options }
    const { toggleComboKey } = normalizedOptions
    const keys = toggleComboKey.split('-').map(k => k[0].toUpperCase() + k.slice(1)).join(dim('+'))
    console.log(`  ${'> Vue Inspector'}: ${green(`Press ${yellow(keys)} in App to toggle the Inspector`)}\n`)
    printed = true
  })
}
