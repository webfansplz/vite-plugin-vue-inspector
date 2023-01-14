import { createUnplugin } from 'unplugin'
import VitePluginInspector from 'vite-plugin-vue-inspector'
import type { Options } from './types'

export default createUnplugin<Options>(options => ({
  name: 'unplugin-vue-inspector',
  vite: VitePluginInspector(options) as any,
}))
