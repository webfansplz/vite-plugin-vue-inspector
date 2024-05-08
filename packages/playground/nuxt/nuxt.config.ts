import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    ['unplugin-vue-inspector/nuxt', {
      enabled: true,
      toggleButtonVisibility: 'always',
      launchEditor: 'code',
    }],
  ],
})
