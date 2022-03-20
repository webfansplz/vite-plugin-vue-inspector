import MagicString from "magic-string"

export interface VueQuery {
  vue?: boolean
  src?: boolean
  type?: "script" | "template" | "style" | "custom"
  index?: number
  lang?: string
  raw?: boolean
  from?: string
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

  return {
    filename,
    query,
  }
}

// vue.js deps add browserHash which that made hot reload work normal
// e.g. node_modules/.vite/vue.js?v=9cc9e54f
export function normalizeOverlayScripts({ hash, scripts }: { scripts: string; hash: string }) {
  const s = new MagicString(scripts)
  s.replace(/browserHash/g, hash)
  return s.toString()
}
