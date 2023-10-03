import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Inspector from 'vite-plugin-vue-inspector'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Vue(),
    VueJsx(),
    Inspector({
      enabled: true,
      openInEditorHost: 'http://localhost:5173',
      toggleButtonVisibility: 'always',
    }),
    Inspect(),
  ],
})
