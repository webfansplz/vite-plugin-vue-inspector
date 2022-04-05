import fs from "fs"
import { fileURLToPath } from "url"
import { resolve, dirname } from "path"
import { parse, compileScript as scriptCompiler, compileStyle as styleCompiler, SFCParseResult } from "@vue/compiler-sfc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const NORMALIZE_VUE_PATH = "/node_modules/.vite/deps/vue.js?v=browserHash"
export const OVERLAY_ID = "vite_vue_inspector_overlay"
export const OVERLAY_CONTAINER_ID = "vite_vue_inspector_overlay_container"
export const OVERLAY_FILE_NAME = "Overlay.vue"
export const OVERLAY_PATH = resolve(__dirname, `../overlay/${OVERLAY_FILE_NAME}`)

export function parseSFC() {
  const sfc = fs.readFileSync(OVERLAY_PATH, "utf-8")
  return parse(sfc)
}

export function compileScript(parsed: SFCParseResult) {
  return scriptCompiler(parsed.descriptor, {
    id: OVERLAY_ID,
  })
}

export function compileStyle(parsed: SFCParseResult) {
  return styleCompiler({
    id: OVERLAY_ID,
    filename: OVERLAY_FILE_NAME,
    source: parsed.descriptor.styles[0].content,
  })
}

export function generateContainerScript() {
  return `
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.id = '${OVERLAY_CONTAINER_ID}'
    document.body.appendChild(container)
  `
}
