
import path from "path"
import MagicString from "magic-string"
import { parse, transform } from "@vue/compiler-dom"
const EXCLUDE_TAG = ["template", "script", "style"]
export async function compileSFCTemplate(
  code: string,
  id: string,
  type: 'template' | 'jsx',
) {
  const s = new MagicString(code)
  const ast = parse(code, { comments: true })
  const result = await new Promise((resolve) => {
    transform(ast, {
      nodeTransforms: [
        (node) => {
          if (node.type === 1) {
            if (node.tagType === 0 && !EXCLUDE_TAG.includes(node.tag)) {
              const { base } = path.parse(id)
              if (node.loc.source.includes("data-v-inspector-file")) return

              switch (type) {
                case 'template':
                  s.prependLeft(
                    node.loc.start.offset + node.tag.length + 1,
                    ` data-v-inspector-file="${id}" data-v-inspector-line=${node.loc.start.line} data-v-inspector-column=${node.loc.start.column} data-v-inspector-title="${base}"`,
                  )
                  break;
                case 'jsx':
                  s.prependLeft(
                    node.loc.start.offset + node.tag.length + 1,
                    ` data-v-inspector-file="${id}" data-v-inspector-line={${node.loc.start.line}} data-v-inspector-column={${node.loc.start.column}} data-v-inspector-title="${base}"`,
                  )
                  break;
                default:
                  break;
              }
            }
          }
        },
      ],
    })
    resolve(s.toString())
  })
  return result
}
