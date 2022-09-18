import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import { yellow, red } from "kolorist"
import { normalizePath, ServerOptions } from "vite"
import type { PluginOption } from "vite"
import { compileSFCTemplate } from "./compiler"
import { parseVueRequest, idToFile } from "./utils"
import { queryParserMiddleware, launchEditorMiddleware } from "./middleware"

function getInspectorPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/vite-plugin-vue-inspector\/dist$/, "/vite-plugin-vue-inspector/src/")
}

export interface VitePluginInspectorOptions {
  /**
  * Vue version
  * @default 3
  */
  vue?: 2 | 3

  /**
  * Default enable state
  * @default false
  */
  enabled?: boolean

  /**
  * Define a combo key to toggle inspector
  * @default 'control-shift' on windows, 'meta-shift' on other os
  *
  * any number of modifiers `control` `shift` `alt` `meta` followed by zero or one regular key, separated by -
  * examples: control-shift, control-o, control-alt-s  meta-x control-meta
  * Some keys have native behavior (e.g. alt-s opens history menu on firefox).
  * To avoid conflicts or accidentally typing into inputs, modifier only combinations are recommended.
  */
  toggleComboKey?: string

  /**
  * Toggle button visibility
  * @default 'active'
  */
  toggleButtonVisibility?: "always" | "active" | "never"

  /**
  * Toggle button display position
  * @default top-right
  */
  toggleButtonPos?: "top-right" | "top-left" | "bottom-right" | "bottom-left"

  /**
  * append an import to the module id ending with `appendTo` instead of adding a script into body
  * useful for frameworks that do not support trannsformIndexHtml hook (e.g. Nuxt3)
  *
  * WARNING: only set this if you know exactly what it does.
  */
  appendTo?: string
}

const DEFAULT_INSPECTOR_OPTIONS: VitePluginInspectorOptions = {
  vue: 3,
  enabled: false,
  toggleComboKey: process.platform === "win32" ? "control-shift" : "meta-shift",
  toggleButtonVisibility: "active",
  toggleButtonPos: "top-right",
  appendTo: "",
} as const

function VitePluginInspector(options: VitePluginInspectorOptions = DEFAULT_INSPECTOR_OPTIONS): PluginOption {
  const inspectorPath = getInspectorPath()
  const normalizedOptions = { ...DEFAULT_INSPECTOR_OPTIONS, ...options }
  let serverOptions: ServerOptions | undefined

  return {
    name: "vite-plugin-vue-inspector",
    enforce: "pre",
    apply(_, { command }) {
      // apply only on serve and not for test
      return command === "serve" && process.env.NODE_ENV !== "test"
    },
    async resolveId(importee: string) {
      if (importee.startsWith("virtual:vue-inspector-options")) {
        return importee
      }
      else if (importee.startsWith("virtual:vue-inspector-path:")) {
        const resolved = importee.replace("virtual:vue-inspector-path:", `${inspectorPath}/`)
        return resolved
      }
    },

    async load(id) {
      if (id === "virtual:vue-inspector-options") {
        return `export default ${JSON.stringify({ ...normalizedOptions, serverOptions })}`
      }
      else if (id.startsWith(inspectorPath)) {
        const { query } = parseVueRequest(id)
        if (query.type) return
        // read file ourselves to avoid getting shut out by vites fs.allow check
        const file = idToFile(id)
        if (fs.existsSync(file))
          return await fs.promises.readFile(file, "utf-8")
        else
          console.error(`failed to find file for vue-inspector: ${file}, referenced by id ${id}.`)
      }
    },
    transform(code, id) {
      const { filename, query } = parseVueRequest(id)

      const isJsx = filename.endsWith(".jsx") || filename.endsWith(".tsx") || (filename.endsWith(".vue") && query.isJsx)
      const isTpl = filename.endsWith(".vue") && query.type !== "style"

      if (isJsx || isTpl)
        return compileSFCTemplate({ code, id: filename, type: isJsx ? "jsx" : "template" })

      if (normalizedOptions.appendTo && filename.endsWith(normalizedOptions.appendTo))
        return { code: `${code}\nimport 'virtual:vue-inspector-path:load.js'` }

      return code
    },
    configureServer(server) {
      server.middlewares.use(queryParserMiddleware)
      server.middlewares.use(launchEditorMiddleware)
      server.httpServer?.once("listening", () => {
        const { toggleComboKey } = normalizedOptions
        setTimeout(() => {
          console.log(`  > vite-plugin-vue-inspector: ${red(`You can enter ${yellow(toggleComboKey.replace(/\-/, "+"))} to toggle the Inspector`)}\n`)
        }, 0)
      })
    },
    transformIndexHtml(html) {
      if (normalizedOptions.appendTo)
        return
      return {
        html,
        tags: [
          {
            tag: "script",
            injectTo: "body",
            attrs: {
              type: "module",
              src: "/@id/virtual:vue-inspector-path:load.js",
            },
          },
        ],
      }
    },
    configResolved(resolvedConfig) {
      serverOptions = resolvedConfig.server
    },
  }
}
export default VitePluginInspector
