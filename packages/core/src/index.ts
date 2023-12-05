import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { bold, dim, green, yellow } from 'kolorist'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ServerOptions } from 'vite'
import MagicString from 'magic-string'
import { compileSFCTemplate } from './compiler'
import { idToFile, parseVueRequest } from './utils'

export interface VueInspectorClient {
  enabled: boolean
  position: {
    x: number
    y: number
  }
  linkParams: {
    file: string
    line: number
    column: number
  }

  enable: () => void
  disable: () => void
  toggleEnabled: () => void
  openInEditor: (baseUrl: string, file: string, line: number, column: number) => void
  onUpdated: () => void
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
   * You can also disable it by setting `false`.
   */
  toggleComboKey?: string | false

  /**
   * Toggle button visibility
   * @default 'active'
   */
  toggleButtonVisibility?: 'always' | 'active' | 'never'

  /**
   * Toggle button display position
   * @default top-right
   */
  toggleButtonPos?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

  /**
   * append an import to the module id ending with `appendTo` instead of adding a script into body
   * useful for frameworks that do not support transformIndexHtml hook (e.g. Nuxt3)
   *
   * WARNING: only set this if you know exactly what it does.
   */
  appendTo?: string | RegExp

  /**
   * Customize openInEditor host (e.g. http://localhost:3000)
   * @default false
   */
  openInEditorHost?: string | false

  /**
   * lazy load inspector times (ms)
   * @default false
   */
  lazyLoad?: number | false

  /**
   * disable inspector on editor open
   * @default false
   */
  disableInspectorOnEditorOpen?: boolean

  /**
   * Hide information in VNode and produce clean html in DevTools
   *
   * Currently, it only works for Vue 3
   *
   * @default true
   */
  cleanHtml?: boolean
}

const toggleComboKeysMap = {
  control: process.platform === 'darwin' ? 'Control(^)' : 'Ctrl(^)',
  meta: 'Command(⌘)',
  shift: 'Shift(⇧)',
}

function getInspectorPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/src')
}

export function normalizeComboKeyPrint(toggleComboKey: string) {
  return toggleComboKey.split('-').map(key => toggleComboKeysMap[key] || key[0].toUpperCase() + key.slice(1)).join(dim('+'))
}

export const DEFAULT_INSPECTOR_OPTIONS: VitePluginInspectorOptions = {
  vue: 3,
  enabled: false,
  toggleComboKey: process.platform === 'darwin' ? 'meta-shift' : 'control-shift',
  toggleButtonVisibility: 'active',
  toggleButtonPos: 'top-right',
  appendTo: '',
  openInEditorHost: false,
  lazyLoad: false,
} as const

function VitePluginInspector(options: VitePluginInspectorOptions = DEFAULT_INSPECTOR_OPTIONS): PluginOption {
  const inspectorPath = getInspectorPath()
  const normalizedOptions = {
    ...DEFAULT_INSPECTOR_OPTIONS,
    ...options,
  }
  let serverOptions: ServerOptions | undefined
  let config: ResolvedConfig

  const {
    vue,
    appendTo,
    cleanHtml = vue === 3, // Only enabled for Vue 3 by default
  } = normalizedOptions

  return [
    {
      name: 'vite-plugin-vue-inspector',
      enforce: 'pre',
      apply(_, { command }) {
        // apply only on serve and not for test
        return command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      async resolveId(importee: string) {
        if (importee.startsWith('virtual:vue-inspector-options')) {
          return importee
        }
        else if (importee.startsWith('virtual:vue-inspector-path:')) {
          const resolved = importee.replace('virtual:vue-inspector-path:', `${inspectorPath}/`)
          return resolved
        }
      },

      async load(id) {
        if (id === 'virtual:vue-inspector-options') {
          return `export default ${JSON.stringify({ ...normalizedOptions, serverOptions })}`
        }
        else if (id.startsWith(inspectorPath)) {
          const { query } = parseVueRequest(id)
          if (query.type)
            return
          // read file ourselves to avoid getting shut out by vites fs.allow check
          const file = idToFile(id)
          if (fs.existsSync(file))
            return await fs.promises.readFile(file, 'utf-8')
          else
            console.error(`failed to find file for vue-inspector: ${file}, referenced by id ${id}.`)
        }
      },
      transform(code, id) {
        const { filename, query } = parseVueRequest(id)

        const isJsx = filename.endsWith('.jsx') || filename.endsWith('.tsx') || (filename.endsWith('.vue') && query.isJsx)
        const isTpl = filename.endsWith('.vue') && query.type !== 'style' && !query.raw

        if (isJsx || isTpl)
          return compileSFCTemplate({ code, id: filename, type: isJsx ? 'jsx' : 'template' })

        if (!appendTo)
          return

        if ((typeof appendTo === 'string' && filename.endsWith(appendTo))
          || (appendTo instanceof RegExp && appendTo.test(filename)))
          return { code: `${code}\nimport 'virtual:vue-inspector-path:load.js'` }
      },
      configureServer(server) {
        const _printUrls = server.printUrls
        const { toggleComboKey } = normalizedOptions

        toggleComboKey && (server.printUrls = () => {
          const keys = normalizeComboKeyPrint(toggleComboKey)
          _printUrls()
          console.log(`  ${green('➜')}  ${bold('Vue Inspector')}: ${green(`Press ${yellow(keys)} in App to toggle the Inspector`)}\n`)
        })
      },
      transformIndexHtml(html) {
        if (appendTo)
          return
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head',
              attrs: {
                type: 'module',
                src: `${config.base || '/'}@id/virtual:vue-inspector-path:load.js`,
              },
            },
          ],
        }
      },
      configResolved(resolvedConfig) {
        config = resolvedConfig
        serverOptions = resolvedConfig.server
      },
    },
    {
      name: 'vite-plugin-vue-inspector:post',
      enforce: 'post',
      apply(_, { command }) {
        // apply only on serve and not for test
        return cleanHtml && vue === 3 && command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      transform(code) {
        if (code.includes('_interopVNode'))
          return
        if (!code.includes('data-v-inspector'))
          return

        const fn = new Set<string>()
        const s = new MagicString(code)

        s.replace(/(createElementVNode|createVNode|createElementBlock) as _\1,?/g, (_, name) => {
          fn.add(name)
          return ''
        })

        if (!fn.size)
          return

        s.appendLeft(0, `/* Injection by vite-plugin-vue-inspector Start */
import { ${Array.from(fn.values()).map(i => `${i} as __${i}`).join(',')} } from 'vue'
function _interopVNode(vnode) {
  if (vnode && vnode.props && 'data-v-inspector' in vnode.props) {
    const data = vnode.props['data-v-inspector']
    delete vnode.props['data-v-inspector']
    Object.defineProperty(vnode.props, '__v_inspector', { value: data, enumerable: false })
  }
  return vnode
}
${Array.from(fn.values()).map(i => `function _${i}(...args) { return _interopVNode(__${i}(...args)) }`).join('\n')}
/* Injection by vite-plugin-vue-inspector End */
`)

        return {
          code: s.toString(),
          map: s.generateMap({ hires: 'boundary' }),
        }
      },
    },
  ]
}
export default VitePluginInspector
