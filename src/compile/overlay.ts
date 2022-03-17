import fs from "fs"
import { resolve } from "path"
import MagicString from "magic-string"
import { parse, compileTemplate, compileScript, compileStyle } from "@vue/compiler-sfc"
export function compileOverlay() {
  const sfc = fs.readFileSync(resolve(__dirname, "./Overlay.vue"), "utf-8")
  const parsed = parse(sfc)
  const { code } = compileTemplate({
    id: "hello",
    filename: "Overlay.vue",
    source: parsed.descriptor.template.content,
  })
  const scriptResult = compileScript(parsed.descriptor, {
    id: "hello",
  })
  const stylesResult = compileStyle({
    id: "hello",
    filename: "Overlay.vue",
    source: parsed.descriptor.styles[0].content,
  })
  let s = new MagicString(scriptResult.content)
  s.prepend(code)
  s.replace("export default", "const App = ")
  s.append("App.render = render")
  s.append(`
    import { createApp } from "vue"
    createApp(App).mount('#div')
  `)
  s = new MagicString(s.toString())
  s.replace(/from "vue"/g, "from \"/node_modules/.vite/vue.js\"")
  const createContainerScript = `
    const container = document.createElement('div')
    container.id = 'div'
    container.style.position = 'fixed'
    document.body.appendChild(container)
  `
  return {
    createContainerScript,
    scripts: s.toString(),
    styles: stylesResult.code,
  }
}
