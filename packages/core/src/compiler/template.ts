import path from 'node:path'
import MagicString from 'magic-string'
import { parse as vueParse, transform as vueTransform } from '@vue/compiler-dom'
import { parse as babelParse, traverse as babelTraverse } from '@babel/core'
import vueJsxPlugin from '@vue/babel-plugin-jsx'
import typescriptPlugin from '@babel/plugin-transform-typescript'
import importMeta from '@babel/plugin-syntax-import-meta'
import decoratorsPlugin from '@babel/plugin-proposal-decorators'
import importAttributesPlugin from '@babel/plugin-syntax-import-attributes'
import { normalizePath } from 'vite'

const EXCLUDE_TAG = ['template', 'script', 'style']
const KEY_DATA = 'data-v-inspector'

interface CompileSFCTemplateOptions {
  code: string
  id: string
  type: 'template' | 'jsx'
}
export async function compileSFCTemplate(
  { code, id, type }: CompileSFCTemplateOptions,
) {
  const s = new MagicString(code)
  const relativePath = normalizePath(path.relative(process.cwd(), id))
  const result = await new Promise((resolve) => {
    switch (type) {
      case 'template': {
        const ast = vueParse(code, { comments: true })
        vueTransform(ast, {
          nodeTransforms: [
            (node) => {
              if (node.type === 1) {
                if (node.tagType === 0 && !EXCLUDE_TAG.includes(node.tag)) {
                  if (node.loc.source.includes(KEY_DATA))
                    return

                  const insertPosition = node.props.length ? Math.max(...node.props.map(i => i.loc.end.offset)) : node.loc.start.offset + node.tag.length + 1
                  const { line, column } = node.loc.start

                  const content = ` ${KEY_DATA}="${relativePath}:${line}:${column}"`

                  s.prependLeft(
                    insertPosition,
                    content,
                  )
                }
              }
            },
          ],
        })

        break
      }

      case 'jsx': {
        const ast = babelParse(code, {
          babelrc: false,
          configFile: false,
          comments: true,
          plugins: [
            importMeta,
            [vueJsxPlugin, {}],
            [
              typescriptPlugin,
              { isTSX: true, allowExtensions: true },
            ],
            [
              decoratorsPlugin,
              { legacy: true },
            ],
            [
              importAttributesPlugin,
              { deprecatedAssertSyntax: true },
            ],
          ],
        })

        babelTraverse(ast, {
          enter({ node }) {
            if (node.type === 'JSXElement') {
              if (node.openingElement.attributes.some(attr => attr.type !== 'JSXSpreadAttribute' && attr.name.name === KEY_DATA,
              ))
                return

              const insertPosition = node.openingElement.end - (node.openingElement.selfClosing ? 2 : 1)
              const { line, column } = node.loc.start

              const content = ` ${KEY_DATA}="${relativePath}:${line}:${column}"`

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
