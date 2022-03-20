import MagicString from "magic-string"

import { SFCScriptBlock } from "@vue/compiler-sfc"
import * as compileTemplate from "vue-template-compiler"
import transpile from "vue-template-es2015-compiler"

import { parseSFC, compileScript, compileStyle, generateContainerScript, NORMALIZE_VUE_PATH, OVERLAY_CONTAINER_ID } from "./compiler"

function toFunction(code: string): string {
  return `function () {${code}}`
}

function normalizeOverlay({
  parsedTemplate,
  parsedScript,
}: {parsedTemplate: string;parsedScript: SFCScriptBlock}): string {
  // transpile code with vue-template-es2015-compiler, which is a forked
  // version of Buble that applies ES2015 transforms + stripping `with` usage
  const normalizedTemplate
      = `${transpile(
        `const render = ${toFunction(parsedTemplate)}\n`,
      )}\n`

  const s = new MagicString(parsedScript.content)
  s.prepend(normalizedTemplate)
  s.prepend(`import Vue from \"${NORMALIZE_VUE_PATH}\"\n`)

  s.replace("export default", "const App = ")
  s.append("App.render = render")

  s.append(`
    new Vue({
    render: h => h(App),
  }).$mount("#${OVERLAY_CONTAINER_ID}")
  `)

  return s.toString()
}

export function compileOverlayV2() {
  const parsed = parseSFC()
  // compile template
  const { render } = compileTemplate.compile(parsed.descriptor.template.content)
  // // compile script
  const parsedScript = compileScript(parsed)
  // compile style
  const parsedStyle = compileStyle(parsed)

  const scripts = normalizeOverlay({
    parsedTemplate: render,
    parsedScript,
  })

  return {
    scripts,
    overlayContainerScript: generateContainerScript(),
    styles: parsedStyle.code,
  }
}
