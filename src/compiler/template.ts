
import path from "path"
import MagicString from "magic-string"
import { parse, transform } from "@vue/compiler-dom"
const EXCLUDE_TAG = ["template", "script", "style"]
interface CompileSFCTemplateOptions {
  code: string
  id: string
  type: "template" | "jsx"
}
export async function compileSFCTemplate(
  { code, id, type }: CompileSFCTemplateOptions,
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

              const insertPosition = node.loc.start.offset + node.tag.length + 1
              const { line, column } = node.loc.start

              const content = {
                template: ` data-v-inspector-file="${id}" data-v-inspector-line=${line} data-v-inspector-column=${column} data-v-inspector-title="${base}"`,
                jsx: ` data-v-inspector-file="${id}" data-v-inspector-line={${line}} data-v-inspector-column={${column}} data-v-inspector-title="${base}"`,
              }[type]

              s.prependLeft(
                insertPosition,
                content)
            }
          }
        },
      ],
    })
    resolve(s.toString())
  })
  return result
}
