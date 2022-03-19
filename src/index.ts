import type { Plugin } from "vite"
import { compileSFCTemplate } from "./compiler"
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
    transform(code, id) {
      if (id.includes(".vue")) return compileSFCTemplate(code, id)
      return code
    },
    configureServer(server) {
      server.middlewares.use(queryParserMiddleware)
      server.middlewares.use(launchEditorMiddleware)
    },
    transformIndexHtml(html) {
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
          children: scripts,
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
