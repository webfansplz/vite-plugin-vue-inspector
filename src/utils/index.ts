export interface VueQuery {
  vue?: boolean
  src?: boolean
  type?: "script" | "template" | "style" | "custom"
  index?: number
  lang?: string
  raw?: boolean
  from?: string
  isJsx?: boolean
}

interface JSXIdentifier {
  type: "JSXIdentifier"
  name: string
}

interface JSXMemberExpression {
  type: "JSXMemberExpression"
  object: JSXMemberExpression | JSXIdentifier
  property: JSXIdentifier
}

export function parseVueRequest(id: string) {
  const [filename] = id.split("?", 2)
  const url = new URL(id, "http://domain.inspector")
  const query = Object.fromEntries(url.searchParams.entries()) as VueQuery
  if (query.vue != null)
    query.vue = true

  if (query.src != null)
    query.src = true

  if (query.index != null)
    query.index = Number(query.index)

  if (query.raw != null)
    query.raw = true

  if (query.hasOwnProperty("lang.tsx") || query.hasOwnProperty("lang.jsx"))
    query.isJsx = true

  return {
    filename,
    query,
  }
}

export function parseJSXIdentifier(name: JSXIdentifier | JSXMemberExpression) {
  if (name.type === "JSXIdentifier")
    return name.name

  else
    return `${parseJSXIdentifier(name.object)}.${parseJSXIdentifier(name.property)}`
}
