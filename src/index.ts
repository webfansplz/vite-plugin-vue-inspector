import type { Plugin } from 'vite'
import { compileSFCTemplate } from './template'
import { queryParserMiddleware, launchEditorMiddleware } from './middleware'

export function ViteInspector(): Plugin {
  return {
    name: 'vite-plugin-inspector',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('.vue')) return compileSFCTemplate(code, id)
      return code
    },
    configureServer(server) {
      server.middlewares.use(queryParserMiddleware)
      server.middlewares.use(launchEditorMiddleware)
    },
  }
}
