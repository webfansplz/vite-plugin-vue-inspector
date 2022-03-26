import type { Plugin } from "vite"
import { compileSFCTemplate } from "./compiler"
import { parseVueRequest, normalizeOverlayScripts } from "./utils"
import { v2, v3 } from "./overlay/index.json"
import { queryParserMiddleware, launchEditorMiddleware } from "./middleware"

export type VitePluginInspectorOptions = {
  vue?: number
}

function VitePluginInspector(options: VitePluginInspectorOptions = { vue: 3 }): Plugin {
  const { scripts, styles, overlayContainerScript } = options.vue === 2 ? v2 : v3

  return {
    name: "vite-plugin-vue-inspector",
    enforce: "pre",
    apply: "serve",
    transform(code, id) {
      const { filename, query } = parseVueRequest(id)
      if (filename.endsWith(".jsx") || filename.endsWith(".tsx") || (filename.endsWith(".vue") && query.isJsx))
        return compileSFCTemplate(code, filename, "jsx")

      if (filename.endsWith(".vue") && query.type !== "style") return compileSFCTemplate(code, filename, "template")
      return code
    },
    configureServer(server) {
      server.middlewares.use(queryParserMiddleware)
      server.middlewares.use(launchEditorMiddleware)
    },
    transformIndexHtml(html, { server }) {
      return {
        html,
        tags: [{
          tag: "script",
          children: overlayContainerScript,
          injectTo: "body",
        }, {
          tag: "script",
          attrs: {
            type: "module",
          },
          children: normalizeOverlayScripts({
            hash: (server as any)._optimizeDepsMetadata.browserHash,
            scripts,
          }),
          injectTo: "body",
        }, {
          tag: "style",
          children: styles,
          injectTo: "head",
        }],
      }
    },
  }
}
export default VitePluginInspector
