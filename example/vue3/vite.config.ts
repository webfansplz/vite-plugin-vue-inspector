import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [Vue(), Inspector()],
})
