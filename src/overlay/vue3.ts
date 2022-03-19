import MagicString from "magic-string"

import { compileTemplate, SFCScriptBlock } from "@vue/compiler-sfc"

import { parseSFC, compileScript, compileStyle, generateContainerScript, OVERLAY_CONTAINER_ID, OVERLAY_ID, OVERLAY_FILE_NAME } from "./compiler"

function normalizeOverlay({
  parsedTemplate,
  parsedScript,
}: {parsedTemplate: string;parsedScript: SFCScriptBlock}): string {
  let s = new MagicString(parsedScript.content)
  s.prepend(parsedTemplate)

  s.replace("export default", "const App = ")
  s.append("App.render = render")

  s.append(`
    import { createApp } from "vue"
    createApp(App).mount('#${OVERLAY_CONTAINER_ID}')
  `)

  s = new MagicString(s.toString())
  s.replace(/from "vue"/g, "from \"/node_modules/.vite/vue.js\"")
  return s.toString()
}

export function compileOverlayV3() {
  const parsed = parseSFC()
  // compile template
  // compile template
  const { code: parsedTemplate } = compileTemplate({
    id: OVERLAY_ID,
    filename: OVERLAY_FILE_NAME,
    source: parsed.descriptor.template.content,
  })
  // // compile script
  const parsedScript = compileScript(parsed)
  // compile style
  const parsedStyle = compileStyle(parsed)

  const scripts = normalizeOverlay({
    parsedTemplate,
    parsedScript,
  })

  return {
    scripts,
    overlayContainerScript: generateContainerScript(),
    styles: parsedStyle.code,
  }
}
