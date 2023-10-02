import { createUnplugin } from 'unplugin'
import VitePluginInspector from 'vite-plugin-vue-inspector'
import type { Options } from './types'

export default createUnplugin<Options, true>((options) => {
  const plugins = VitePluginInspector(options) as any
  return [
    {
      name: 'unplugin-vue-inspector',
      vite: plugins[0],
    },
    {
      name: 'unplugin-vue-inspector:post',
      vite: plugins[1],
    },
  ]
})
