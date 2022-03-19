import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Inspector from "../../src/index"

export default defineConfig({
  plugins: [Vue(), Inspector()],
})
