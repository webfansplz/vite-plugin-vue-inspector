import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import { ViteInspector } from "../src/index"

export default defineConfig({
  build: {
    sourcemap: process.env.SOURCE_MAP === "true",
  },
  plugins: [Vue(), ViteInspector()],
})
