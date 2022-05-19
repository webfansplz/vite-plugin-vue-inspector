import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [
    createVuePlugin({
      jsx: true,
      jsxOptions: {
        compositionAPI: true,
      },
    }),
    Inspector({
      vue: 2,
      toggleButtonVisibility: "always",
      enabled: true,
    }),
  ],
})
