import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Inspector from 'vite-plugin-vue-inspector'

export default defineConfig({
  plugins: [
    Vue(),
    VueJsx(),
    Inspector({
      enabled: true,
      toggleButtonVisibility: 'always',
    }),
  ],
})
