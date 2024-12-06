import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import vueJsx from '@vitejs/plugin-vue2-jsx'
import Inspector from 'unplugin-vue-inspector/vite'

export default defineConfig({
  plugins: [
    vueJsx({
      babelPlugins: [['@babel/plugin-proposal-decorators', { legacy: true }], ['@babel/plugin-proposal-class-properties', { loose: true }]],
    }),
    vue(),
    Inspector({
      vue: 2,
      toggleButtonVisibility: 'always',
      enabled: true,
      disableInspectorOnEditorOpen: true,
    }),
  ],
})
