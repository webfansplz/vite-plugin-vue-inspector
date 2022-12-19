import path from "path"
import type { Connect } from "vite"
import { launchEditor } from "./launch-editor"
export const SERVER_URL = "/__open-stack-frame-in-editor"

type RequestMessage = Parameters<Connect.NextHandleFunction>[0]
export const queryParserMiddleware: Connect.NextHandleFunction = (
  req: RequestMessage & { query?: object },
  _,
  next,
) => {
  if (!req.query && req.url?.includes(SERVER_URL)) {
    const url = new URL(req.url, "http://domain.inspector")
    req.query = Object.fromEntries(url.searchParams.entries())
  }
  next()
}

export const launchEditorMiddleware: Connect.NextHandleFunction = (
  req: RequestMessage & {
    query?: { line: number; column: number; file: string }
  },
  res,
  next,
) => {
  if (req.url.includes(SERVER_URL)) {
    const { file, line, column } = req.query
    if (!file) {
      res.statusCode = 500
      res.end("launch-editor-middleware: required query param \"file\" is missing.")
    }
    const lineNumber = +line || 1
    const columnNumber = +column || 1
    launchEditor(path.join(process.cwd(), file), lineNumber, columnNumber)
    res.end()
  }
  else {
    next()
  }
}
