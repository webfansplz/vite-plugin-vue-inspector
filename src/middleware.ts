import type { Connect } from "vite"
import { launchEditor } from "./launchEditor"
export const SERVER_URL = "/__open-stack-frame-in-editor"

type RequestMessage = Parameters<Connect.NextHandleFunction>[0]
export const queryParserMiddleware: Connect.NextHandleFunction = (
  req: RequestMessage & {query?: object},
  _,
  next,
) => {
  if (!req.query && req.url?.startsWith(SERVER_URL)) {
    const url = new URL(req.url, "http://domain.inspector")
    req.query = Object.fromEntries(url.searchParams.entries())
  }
  next()
}

export const launchEditorMiddleware: Connect.NextHandleFunction = (
  req: RequestMessage & {
    query?: {line: number; column: number; file: string}
  },
  res,
  next,
) => {
  if (req.url.startsWith(SERVER_URL)) {
    const line = +req.query.line || 1
    const column = +req.query.column || 1
    launchEditor(req.query.file, line, column)
    res.end()
  }
  else {
    next()
  }
}
