import { defineNuxtConfig } from "nuxt"
import Inspector from "vite-plugin-vue-inspector"

export default defineNuxtConfig({
  vite: {
    plugins: [
      Inspector(),
    ],
  },
})
