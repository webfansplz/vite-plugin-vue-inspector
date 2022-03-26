import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import VueJsx from "@vitejs/plugin-vue-jsx"
import Inspector from "../../src/index"

export default defineConfig({
  plugins: [Vue(), VueJsx(), Inspector()],
})
