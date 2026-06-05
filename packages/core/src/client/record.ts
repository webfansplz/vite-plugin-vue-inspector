import type { VNode } from 'vue'

const KEY_DATA = 'data-v-inspector'
const KEY_IGNORE = 'data-v-inspector-ignore'
const KEY_PROPS_DATA = '__v_inspector'
const KEY_GLOBAL = '__vue_inspector_store__'

export type PositionInfo = [source: string, line: number, column: number]

interface Store {
  hasData: boolean
  vnodeToPos: WeakMap<object, PositionInfo>
  fileToVNode: Map<string, WeakSet<object>>
  posToVNode: Map<string, Map<number, Map<number, WeakSet<object>>>>
  events?: unknown
}

const globalStore = globalThis as typeof globalThis & {
  [KEY_GLOBAL]?: Store
}

const store: Store =
  globalStore[KEY_GLOBAL] ??
  ({
    hasData: false,
    vnodeToPos: new WeakMap(),
    fileToVNode: new Map(),
    posToVNode: new Map(),
  } satisfies Store)

if (!globalStore[KEY_GLOBAL]) {
  Object.defineProperty(globalStore, KEY_GLOBAL, {
    value: store,
    configurable: true,
    enumerable: false,
  })
}

export function getInternalStore(): Store {
  return store
}

function parsePositionInfo(value: unknown): PositionInfo | undefined {
  if (typeof value !== 'string') return
  const match = value.match(/^(.+):(\d+):(\d+)$/)
  if (!match) return
  return [match[1]!, Number(match[2]), Number(match[3])]
}

function moveInspectorDataToHiddenProps(props: Record<string, unknown>): void {
  const data = props[KEY_DATA]
  if (typeof data !== 'string') return

  delete props[KEY_DATA]

  if (KEY_PROPS_DATA in props) return

  Object.defineProperty(props, KEY_PROPS_DATA, {
    value: data,
    configurable: true,
    enumerable: false,
  })
}

export function recordPosition(source: string, line: number, column: number, node: VNode): VNode {
  if (!node || typeof node === 'string' || typeof node === 'number') return node

  store.hasData = true

  const props = (node.props ||= {}) as Record<string, unknown>
  moveInspectorDataToHiddenProps(props)
  store.vnodeToPos.set(props, [source, line, column])

  if (!store.fileToVNode.has(source)) store.fileToVNode.set(source, new WeakSet())
  store.fileToVNode.get(source)!.add(props)

  if (!store.posToVNode.has(source)) store.posToVNode.set(source, new Map())
  const lineMap = store.posToVNode.get(source)!
  if (!lineMap.has(line)) lineMap.set(line, new Map())
  const columnMap = lineMap.get(line)!
  if (!columnMap.has(column)) columnMap.set(column, new WeakSet())
  columnMap.get(column)!.add(props)

  return node
}

function getPositionFromVNode(node: VNode): PositionInfo | undefined {
  const props = node?.props as Record<string, unknown> | undefined
  if (!props) return
  return store.vnodeToPos.get(props) ?? parsePositionInfo(props[KEY_PROPS_DATA])
}

function getComponentPositionFromElement(el: Element): [PositionInfo, VNode] | undefined {
  const vnode = (el as any).__vnode?.ctx?.vnode as VNode | undefined
  if (!vnode || vnode.el !== el) return

  const pos = getPositionFromVNode(vnode)
  if (!pos) return

  return [pos, vnode]
}

function isSamePosition(a: PositionInfo | undefined, b: PositionInfo): boolean {
  return Boolean(a && a[0] === b[0] && a[1] === b[1] && a[2] === b[2])
}

export class ElementTraceInfo {
  pos: PositionInfo
  vnode: VNode | undefined
  el: Element | undefined

  constructor(pos: PositionInfo, el?: Element, vnode?: VNode) {
    this.vnode = vnode
    this.pos = pos
    this.el = el
  }

  get filepath(): string {
    return this.pos[0]
  }

  get fullpath(): string {
    let file = this.pos[0]
    if (this.pos[1]) {
      file += `:${this.pos[1]}`
      if (this.pos[2]) file += `:${this.pos[2]}`
    }
    return file
  }

  get rect(): DOMRect | undefined {
    return this.el?.getBoundingClientRect()
  }

  getElementsSameFile(): Element[] | undefined {
    return Array.from(document.querySelectorAll('*')).filter(
      (el) => el !== this.el && findTraceFromElement(el)?.filepath === this.filepath,
    )
  }

  getParent(): ElementTraceInfo | undefined {
    const parentVNode = (this.vnode as any)?.parent
    const parentEl = this.el?.parentElement
    return findTraceFromVNode(parentVNode) ?? findTraceFromElement(parentEl)
  }

  getElementsSamePosition(): Element[] | undefined {
    const selector =
      typeof this.vnode?.type === 'string' ? this.vnode.type : this.el?.tagName.toLowerCase() || '*'

    return Array.from(document.querySelectorAll(selector)).filter(
      (el) => el !== this.el && isSamePosition(findTraceFromElement(el)?.pos, this.pos),
    )
  }
}

export function findTraceFromElement(el?: Element | null): ElementTraceInfo | undefined {
  if (!el) return
  const vnode: VNode | undefined = (el as any).__vnode
  const vnodeTrace = findTraceFromVNode(vnode, el)
  if (vnodeTrace) return vnodeTrace

  const componentPosition = getComponentPositionFromElement(el)
  if (componentPosition) return new ElementTraceInfo(componentPosition[0], el, componentPosition[1])

  const attrPos = parsePositionInfo(el.getAttribute(KEY_DATA))
  if (attrPos) return new ElementTraceInfo(attrPos, el, vnode)
}

export function findTraceFromVNode(vnode?: VNode, el?: Element): ElementTraceInfo | undefined {
  if (!vnode) return
  const pos = getPositionFromVNode(vnode)
  if (!pos) return
  return new ElementTraceInfo(pos, (el ?? vnode?.el ?? undefined) as any, vnode)
}

export function findTraceAtPointer(e: { x: number; y: number }): ElementTraceInfo | undefined {
  let elements = document.elementsFromPoint(e.x, e.y)
  const ignoreIndex = elements.findIndex((node) => node?.hasAttribute?.(KEY_IGNORE))
  if (ignoreIndex !== -1) elements = elements.slice(ignoreIndex + 1)

  for (const el of elements) {
    const match = findTraceFromElement(el)
    if (match) return match
  }
}

export function hasData(): boolean {
  return (
    store.hasData ||
    (typeof document !== 'undefined' && document.querySelector(`[${KEY_DATA}]`) != null)
  )
}
