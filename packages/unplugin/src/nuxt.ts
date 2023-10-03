import { green, yellow } from 'kolorist'
import { DEFAULT_INSPECTOR_OPTIONS, normalizeComboKeyPrint } from 'vite-plugin-vue-inspector'
import type { Options } from './types'
import unplugin from '.'

export default (options: Options, nuxt: any) => {
  nuxt.hook('vite:extendConfig', async (config: any) => {
    config.plugins = config.plugins || []
    config.plugins.push(...unplugin.vite({
      appendTo: /\/entry\.m?js$/,
      ...options,
    }))
  })
  let printed = false
  nuxt.hook('vite:serverCreated', () => {
    const normalizedOptions = { ...DEFAULT_INSPECTOR_OPTIONS, ...options }
    const { toggleComboKey } = normalizedOptions
    if (printed || !toggleComboKey)
      return
    const keys = normalizeComboKeyPrint(toggleComboKey)
    console.log(`  ${'> Vue Inspector'}: ${green(`Press ${yellow(keys)} in App to toggle the Inspector`)}\n`)
    printed = true
  })
}
