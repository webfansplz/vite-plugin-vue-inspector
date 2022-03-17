import type { Plugin } from "vite"
import { compileSFCTemplate } from "./template"
import { compileOverlay } from "./compile/overlay"
import { queryParserMiddleware, launchEditorMiddleware } from "./middleware"

export function ViteInspector(): Plugin {
  const { scripts, styles, createContainerScript } = compileOverlay()
  return {
    name: "vite-plugin-inspector",
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
          children: createContainerScript,
          injectTo: "body",
        }, {
          tag: "script type=\"module\"",
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
