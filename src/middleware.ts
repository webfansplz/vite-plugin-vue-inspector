import type { Connect } from "vite"
import { launchEditor } from "./launchEditor"
export const SERVER_URL = "/__open-stack-frame-in-editor"

export const queryParserMiddleware: Connect.NextHandleFunction = (
  req: Parameters<Connect.NextHandleFunction>[0] & {query?: object},
  _,
  next,
) => {
  if (!req.query && req.url?.startsWith(SERVER_URL)) {
    const url = new URL(req.url)
    req.query = Object.fromEntries(url.searchParams.entries())
  }
  next()
}

export const launchEditorMiddleware: Connect.NextHandleFunction = (
  req: Parameters<Connect.NextHandleFunction>[0] & {
    query?: {line: number; column: number; fileName: string}
  },
  res,
  next,
) => {
  if (req.url.startsWith(SERVER_URL)) {
    const line = req.query.line || 1
    const column = req.query.column || 1
    launchEditor(req.query.fileName, line, column)
    res.end()
  }
  else {
    next()
  }
}
