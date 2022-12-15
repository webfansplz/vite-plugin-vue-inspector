const warn = console.warn
console.warn = function (...data) {
  const skipMsgPrefix = "[Vue warn]: Extraneous non-props attributes "
  let msg = data[0] || ""
  if (msg.startsWith(skipMsgPrefix)) {
    msg = msg.replace(/\([^)]+\)/, function (match) {
      const attributes = match
        .slice(1, -1)
        .split(', ')
        .filter(function (item) {
          return !/^data-v-inspector-(file|line|column|title)$/.test(item)
        })
        .join(', ')
      return '(' + attributes + ')'
    })
    if (msg.slice(skipMsgPrefix.length).startsWith('()')) return
    if (msg) data[0] = msg
  }
  warn(...data)
}
