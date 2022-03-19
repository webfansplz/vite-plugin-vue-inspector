
import MagicString from "magic-string"
import { parse, transform } from "@vue/compiler-dom"
const EXCLUDE_TAG = ["template", "script", "style"]
export async function compileSFCTemplate(
  code: string,
  id: string,
) {
  const s = new MagicString(code)
  const ast = parse(code, { comments: true })
  const result = await new Promise((resolve) => {
    transform(ast, {
      nodeTransforms: [
        (node) => {
          if (node.type === 1) {
            if (node.tagType === 0 && !EXCLUDE_TAG.includes(node.tag)) {
              const normalizedId = !id.endsWith(".vue") ? id.split("?")?.[0] : id
              !node.loc.source.includes("v_file")
                && s.prependLeft(
                  node.loc.start.offset + node.tag.length + 1,
                  ` v_file="${normalizedId}" v_line=${node.loc.start.line} v_column=${node.loc.start.column}`,
                )
            }
          }
        },
      ],
    })
    resolve(s.toString())
  })
  return result
}
