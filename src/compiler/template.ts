
import path from "path"
import MagicString from "magic-string"
import { parse as vueParse, transform as vueTransform } from "@vue/compiler-dom"
import { parse as babelParse, traverse as babelTraverse } from "@babel/core"
import vueJsxPlugin from "@vue/babel-plugin-jsx"
import typescriptPlugin from "@babel/plugin-transform-typescript"
import importMeta from "@babel/plugin-syntax-import-meta"
import { parseJSXIdentifier } from "../utils"

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
  const { base } = path.parse(id)

  const result = await new Promise((resolve) => {
    switch (type) {
      case "template": {
        const ast = vueParse(code, { comments: true })
        vueTransform(ast, {
          nodeTransforms: [
            (node) => {
              if (node.type === 1) {
                if (node.tagType === 0 && !EXCLUDE_TAG.includes(node.tag)) {
                  if (node.loc.source.includes("data-v-inspector-file")) return

                  const insertPosition = node.loc.start.offset + node.tag.length + 1
                  const { line, column } = node.loc.start

                  const content = ` data-v-inspector-file="${id}" data-v-inspector-line=${line} data-v-inspector-column=${column} data-v-inspector-title="${base}"`

                  s.prependLeft(
                    insertPosition,
                    content)
                }
              }
            },
          ],
        })

        break
      }

      case "jsx": {
        const ast = babelParse(code, {
          babelrc: false,
          comments: true,
          plugins: [
            importMeta,
            [vueJsxPlugin, {}],
            [
              typescriptPlugin,
              // @ts-ignore
              { isTSX: true, allowExtensions: true },
            ],
          ],
        })

        babelTraverse(ast, {
          enter({ node }) {
            if (node.type === "JSXElement") {
              if (node.openingElement.attributes.some(attr => attr.type !== "JSXSpreadAttribute" && attr.name.name === "data-v-inspector-file",
              )) return

              const insertPosition = node.start + parseJSXIdentifier(node.openingElement.name as any).length + 1
              const { line, column } = node.loc.start

              const content = ` data-v-inspector-file="${id}" data-v-inspector-line={${line}} data-v-inspector-column={${column}} data-v-inspector-title="${base}"`

              s.prependLeft(
                insertPosition,
                content)
            }
          },
        })
        break
      }

      default:
        break
    }

    resolve(s.toString())
  })

  return result
}
