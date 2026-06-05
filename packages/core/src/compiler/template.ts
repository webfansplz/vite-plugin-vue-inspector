import path from 'node:path'
import { parse as vueParse, transform as vueTransform } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { normalizePath } from 'vite'

const EXCLUDE_TAG = ['template', 'script', 'style']
const KEY_DATA = 'data-v-inspector'

interface CompileTemplateFallbackOptions {
  code: string
  id: string
  vapor?: boolean
  onVaporDetected?: (vapor: boolean) => void
}

function hasVaporAttribute(ast: ReturnType<typeof vueParse>) {
  return ast.children.some((node) => {
    return (
      node.type === 1 &&
      (node.tag === 'script' || node.tag === 'template') &&
      node.props.some((prop) => prop.type === 6 && prop.name === 'vapor')
    )
  })
}

function hasInspectorAttribute(node: any): boolean {
  return node.props.some((prop: any) => prop.type === 6 && prop.name === KEY_DATA)
}

export function compileTemplateFallback({
  code,
  id,
  vapor = false,
  onVaporDetected,
}: CompileTemplateFallbackOptions) {
  const ast = vueParse(code, { comments: true })
  const detectedVapor = vapor || hasVaporAttribute(ast)
  onVaporDetected?.(detectedVapor)

  const s = new MagicString(code)
  const relativePath = normalizePath(path.relative(process.cwd(), id))
  let hit = false

  vueTransform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type !== 1) return
        if (EXCLUDE_TAG.includes(node.tag)) return
        if (hasInspectorAttribute(node)) return

        const isNative = node.tagType === 0
        const isComponent = node.tagType === 1
        if (!isNative && (!isComponent || detectedVapor)) return

        const insertPosition = node.props.length
          ? Math.max(...node.props.map((prop: any) => prop.loc.end.offset))
          : node.loc.start.offset + node.tag.length + 1
        const { line, column } = node.loc.start

        hit = true
        s.prependLeft(insertPosition, ` ${KEY_DATA}="${relativePath}:${line}:${column}"`)
      },
    ],
  })

  if (!hit) return

  return {
    code: s.toString(),
    map: s.generateMap({
      hires: true,
      source: id,
      includeContent: true,
    }),
  }
}
