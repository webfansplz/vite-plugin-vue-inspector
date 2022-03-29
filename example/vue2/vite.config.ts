import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import Inspector from "../../src/index"

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
    }),
  ],
})
