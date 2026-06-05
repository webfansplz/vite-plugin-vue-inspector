import type {} from '@vitejs/devtools-kit'
import type { PluginOption, ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { walk } from 'estree-walker'
import { bold, dim, green, yellow } from 'kolorist'
import MagicString from 'magic-string'
import { SourceMapConsumer } from 'source-map-js'
import { normalizePath } from 'vite'
import { compileTemplateFallback } from './compiler/template'
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
  onEnabled: () => void
  onDisabled: () => void

  openInEditor: (url: URL) => Promise<unknown>
  onUpdated: () => void
}

export interface VitePluginInspectorOptions {
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
   * Target editor when open in editor (v5.1.0+)
   *
   * @default process.env.LAUNCH_EDITOR ?? code (Visual Studio Code)
   */
  launchEditor?: string

  /**
   * Disable animation/transition, will auto disable when `prefers-reduced-motion` is set
   * @default false
   */
  reduceMotion?: boolean

  /**
   * Register Vue Inspector as a Vite DevTools dock action.
   *
   * @default true
   */
  viteDevtools?: boolean
}

const toggleComboKeysMap: Record<string, string> = {
  control: process.platform === 'darwin' ? 'Control(^)' : 'Ctrl(^)',
  meta: 'Command(⌘)',
  shift: 'Shift(⇧)',
}

const vnodeFactoryNames = [
  'h',
  '_createElementVNode',
  '_createElementBlock',
  '_createBlock',
  '_createVNode',
  '_createStaticVNode',
]
const vnodeFactoryRE = new RegExp(`\\b(?:${vnodeFactoryNames.join('|')})\\(`)
const recordImport = 'virtual:vue-inspector-path:client/record.ts'

function getInspectorPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/src')
}

function normalizeComboKeyPrint(toggleComboKey: string) {
  return toggleComboKey
    .split('-')
    .map((key) => toggleComboKeysMap[key] || key[0].toUpperCase() + key.slice(1))
    .join(dim('+'))
}

export const DEFAULT_INSPECTOR_OPTIONS: VitePluginInspectorOptions = {
  enabled: false,
  toggleComboKey: process.platform === 'darwin' ? 'meta-shift' : 'control-shift',
  toggleButtonVisibility: 'active',
  toggleButtonPos: 'top-right',
  appendTo: '',
  lazyLoad: false,
  launchEditor: process.env.LAUNCH_EDITOR ?? 'code',
  reduceMotion: false,
  viteDevtools: true,
} as const

function VitePluginInspector(
  options: VitePluginInspectorOptions = DEFAULT_INSPECTOR_OPTIONS,
): PluginOption {
  const inspectorPath = getInspectorPath()
  const normalizedOptions = {
    ...DEFAULT_INSPECTOR_OPTIONS,
    ...options,
  }
  let config: ResolvedConfig
  const vaporSFCs = new Set<string>()
  const { appendTo } = normalizedOptions

  if (normalizedOptions.launchEditor) process.env.LAUNCH_EDITOR = normalizedOptions.launchEditor

  return [
    {
      name: 'vite-plugin-vue-inspector:fallback',
      enforce: 'pre',
      apply(_, { command }) {
        return command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      transform(code, id) {
        const { filename, query } = parseVueRequest(id)
        const isVue = filename.endsWith('.vue')
        const isVueMain = isVue && !query.type && !query.raw
        const isVueTemplate = isVue && query.type === 'template' && !query.raw

        if (!isVueMain && !isVueTemplate) return

        return compileTemplateFallback({
          code,
          id: filename,
          vapor: query.vapor || vaporSFCs.has(filename),
          onVaporDetected: isVueMain
            ? (vapor) => {
                if (vapor) vaporSFCs.add(filename)
                else vaporSFCs.delete(filename)
              }
            : undefined,
        })
      },
    },
    {
      name: 'vite-plugin-vue-inspector',
      enforce: 'post',
      apply(_, { command }) {
        return command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      async resolveId(importee: string) {
        if (importee.startsWith('virtual:vue-inspector-options')) {
          return importee
        } else if (importee.startsWith('virtual:vue-inspector-path:')) {
          return importee.replace('virtual:vue-inspector-path:', `${inspectorPath}/`)
        }
      },
      async load(id) {
        if (id === 'virtual:vue-inspector-options') {
          return `export default ${JSON.stringify({ ...normalizedOptions, base: config.base })}`
        } else if (id.startsWith(inspectorPath)) {
          const { query } = parseVueRequest(id)
          if (query.type) return
          const file = idToFile(id)
          if (fs.existsSync(file)) return await fs.promises.readFile(file, 'utf-8')
          else
            console.error(`failed to find file for vue-inspector: ${file}, referenced by id ${id}.`)
        }
      },
      transform(code, id) {
        const { filename, query } = parseVueRequest(id)
        let resultCode = code
        let resultMap: any

        const isVueMain = filename.endsWith('.vue') && !query.type && !query.raw
        if (isVueMain) {
          if (query.vapor) vaporSFCs.add(filename)
          else vaporSFCs.delete(filename)
        }

        if (
          appendTo &&
          ((typeof appendTo === 'string' && filename.endsWith(appendTo)) ||
            (appendTo instanceof RegExp && appendTo.test(filename)))
        ) {
          resultCode = `${resultCode}\nimport 'virtual:vue-inspector-path:load.js'`
        }

        if ((this as any).environment?.name && (this as any).environment.name !== 'client')
          return resultCode === code ? undefined : { code: resultCode }

        if (vaporSFCs.has(filename)) return resultCode === code ? undefined : { code: resultCode }

        if (!code.includes('_sfc_render(') || !vnodeFactoryRE.test(code))
          return resultCode === code ? undefined : { code: resultCode }

        if (code.includes('_vueInspectorRecord('))
          return resultCode === code ? undefined : { code: resultCode }

        function offsetToPos(index: number): { line: number; column: number } {
          const lines = code.slice(0, index).split('\n')
          return {
            line: lines.length,
            column: lines.at(-1)!.length,
          }
        }

        const map = this.getCombinedSourcemap()
        const consumer = new SourceMapConsumer(map as any)
        const s = new MagicString(code)
        const ast = this.parse(code)
        let hit = false

        walk(ast as any, {
          enter(node) {
            if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier') return
            if (!vnodeFactoryNames.includes(node.callee.name)) return

            const { start, end } = node as any as { start: number; end: number }
            const generated = offsetToPos(start)
            const original = consumer.originalPositionFor(generated)
            if (original.source == null || original.line == null || original.column == null) return

            hit = true
            s.appendLeft(start, `_vueInspectorRecord(${original.line},${original.column},`)
            s.appendRight(end, ')')
          },
        })

        if (hit) {
          const relativeFile = normalizePath(path.relative(process.cwd(), filename))
          s.prepend(
            `import { recordPosition as _vueInspectorRecordPosition } from ${JSON.stringify(recordImport)}\n`,
          )
          s.append(
            `\nfunction _vueInspectorRecord(line, column, vnode) { return _vueInspectorRecordPosition(${JSON.stringify(relativeFile)}, line, column, vnode) }\n`,
          )
          resultCode = resultCode === code ? s.toString() : resultCode.replace(code, s.toString())
          resultMap = s.generateMap({ hires: true })
        }

        if (resultCode !== code) {
          return {
            code: resultCode,
            map: resultMap,
          }
        }
      },
      configureServer(server) {
        const _printUrls = server.printUrls.bind(server)
        const { toggleComboKey } = normalizedOptions

        if (toggleComboKey) {
          server.printUrls = () => {
            const keys = normalizeComboKeyPrint(toggleComboKey)
            _printUrls()
            console.log(
              `  ${green('➜')}  ${bold('Vue Inspector')}: ${green(`Press ${yellow(keys)} in App to toggle the Inspector`)}\n`,
            )
          }
        }
      },
      transformIndexHtml(html) {
        if (appendTo) return
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
      },
      ...(normalizedOptions.viteDevtools
        ? {
            devtools: {
              setup(ctx) {
                ctx.docks.register({
                  id: 'vue-inspector',
                  title: 'Vue Inspector',
                  icon: 'ph:cursor-click-duotone',
                  type: 'action',
                  action: {
                    importFrom: 'vite-plugin-vue-inspector/client/vite-devtools',
                    importName: 'default',
                  },
                })
              },
            },
          }
        : {}),
    },
  ]
}

export default VitePluginInspector
