<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import inspectorOptions from "virtual:vue-inspector-options"
import ToggleButton from "./components/ToggleButton.vue"

// Types
interface Position {
  x: number
  y: number
  width: number
  height: number
}

interface LinkParams {
  file: string
  line: number
  column: number
  title?: string
}

interface TargetNodeResult {
  targetNode: HTMLElement | null
  params: LinkParams | null
}

// Constants
const base = inspectorOptions.base
const KEY_DATA = "data-v-inspector"
const KEY_IGNORE = "data-v-inspector-ignore"
const KEY_PROPS_DATA = "__v_inspector"

const getData = (el: HTMLElement | null): string | null =>
  ((el as any)?.__vnode?.props?.[KEY_PROPS_DATA] as string | undefined) ??
  getComponentData(el) ??
  el?.getAttribute?.(KEY_DATA) ??
  null

const getComponentData = (el: HTMLElement | null): string | null => {
  const ctxVNode = (el as any)?.__vnode?.ctx?.vnode
  if (ctxVNode?.el === el) {
    return (ctxVNode?.props?.[KEY_PROPS_DATA] as string | undefined) ?? null
  }
  return null
}

defineOptions({
  name: "VueInspectorOverlay",
})

// Reactive State
const floatsRef = ref<HTMLElement | null>(null)
const enabled = ref(inspectorOptions.enabled)
const toggleCombo = ref(inspectorOptions.toggleComboKey?.toLowerCase?.()?.split?.("-") ?? false)
const disableInspectorOnEditorOpen = ref(inspectorOptions.disableInspectorOnEditorOpen)
const overlayVisible = ref(false)
const position = ref<Position>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})
const linkParams = ref<LinkParams>({
  file: "",
  line: 0,
  column: 0,
})
const animation = ref(!inspectorOptions.reduceMotion)

const containerVisible = computed(() => {
  const { toggleButtonVisibility } = inspectorOptions
  return toggleButtonVisibility === "always" || (toggleButtonVisibility === "active" && enabled.value)
})

const floatsStyle = computed(() => {
  let margin = 10
  let x = position.value.x + position.value.width / 2
  let y = position.value.y + position.value.height + 5
  const floatsWidth = floatsRef.value?.clientWidth ?? 0
  const floatsHeight = floatsRef.value?.clientHeight ?? 0

  x = Math.max(margin, x)
  x = Math.min(x, window.innerWidth - floatsWidth - margin)
  if (x < floatsWidth / 2) {
    x = floatsWidth / 2 + margin
  }

  y = Math.max(margin, y)
  y = Math.min(y, window.innerHeight - floatsHeight - margin)

  return {
    left: `${x}px`,
    top: `${y}px`,
  }
})

const sizeIndicatorStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: `${position.value.width}px`,
  height: `${position.value.height}px`,
}))

// methods
const toggleEventListener = (add: boolean) => {
  const method = add ? document.body.addEventListener : document.body.removeEventListener
  method("mousemove", updateLinkParams)
  method("resize", closeOverlay, true)
  method("click", handleClick, true)
}

const toggleEnabled = () => {
  enabled.value = !enabled.value
  overlayVisible.value = false
  toggleEventListener(enabled.value)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.repeat || event.key === undefined) return

  const isCombo = toggleCombo.value ? toggleCombo.value.every((key) => isKeyActive(key, event)) : false
  if (isCombo) toggleEnabled()
}

const isKeyActive = (key: string, event: KeyboardEvent): boolean => {
  switch (key) {
    case "shift":
    case "control":
    case "alt":
    case "meta":
      return event.getModifierState(key.charAt(0).toUpperCase() + key.slice(1))
    default:
      return key === event.key.toLowerCase()
  }
}

const isChildOf = (ele: Node | null, target: Node): boolean => {
  if (!ele || ele === document) return false
  return ele === target ? true : isChildOf(ele.parentNode, target)
}

const getTargetNode = (e: MouseEvent): TargetNodeResult => {
  const splitRE = /(.+):([\d]+):([\d]+)$/

  const path = e?.composedPath()
  if (!path) {
    return {
      targetNode: null,
      params: null,
    }
  }

  const ignoreIndex = path.findIndex((node) => (node as HTMLElement)?.hasAttribute?.(KEY_IGNORE))
  const targetNode = path.slice(ignoreIndex + 1).find((node) => getData(node as HTMLElement)) as HTMLElement | undefined

  if (!targetNode) {
    return {
      targetNode: null,
      params: null,
    }
  }

  const match = getData(targetNode)?.match(splitRE)
  const [_, file, line, column] = match || []

  return {
    targetNode,
    params: match
      ? {
          file,
          line: Number(line),
          column: Number(column),
          title: file,
        }
      : null,
  }
}

const handleClick = (e: MouseEvent) => {
  const { targetNode, params } = getTargetNode(e)

  if (!targetNode) return

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const { file, line, column } = params
  overlayVisible.value = false
  const url = new URL(
    `${base}__open-in-editor?file=${encodeURIComponent(`${file}:${line}:${column}`)}`,
    import.meta.url
  )
  openInEditor(url)
}

const updateLinkParams = (e: MouseEvent) => {
  const { targetNode, params } = getTargetNode(e)
  if (targetNode) {
    const rect = targetNode.getBoundingClientRect()
    overlayVisible.value = true
    position.value = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }
    linkParams.value = params || { file: "", line: 0, column: 0 }
  } else {
    closeOverlay()
  }
  onUpdated()
}

const closeOverlay = () => {
  overlayVisible.value = false
  linkParams.value = {
    file: "",
    line: 0,
    column: 0,
  }
}

// Public methods
const enable = () => {
  if (enabled.value) return
  toggleEnabled()
}

const disable = () => {
  if (!enabled.value) return
  toggleEnabled()
}

const openInEditor = async (baseUrl: URL | string, file?: string, line?: number, column?: number) => {
  /**
   * Vite built-in support
   * https://github.com/vitejs/vite/blob/d59e1acc2efc0307488364e9f2fad528ec57f204/packages/vite/src/node/server/index.ts#L569-L570
   */

  const _url =
    baseUrl instanceof URL
      ? baseUrl
      : `${baseUrl}/__open-in-editor?file=${encodeURIComponent(`${file}:${line}:${column}`)}`
  const promise = fetch(_url, { mode: "no-cors" })

  if (disableInspectorOnEditorOpen.value) {
    promise.then(() => disable())
  }

  return promise
}

const onUpdated = () => {
  // Placeholder for programmatic replacement
}

const onEnabled = () => {
  // Placeholder for programmatic replacement
}

const onDisabled = () => {
  // Placeholder for programmatic replacement
}

// Watchers
watch(enabled, (val, oldVal) => {
  if (val === oldVal) return
  if (val) onEnabled()
  else onDisabled()
})

// Lifecycle Hooks
onMounted(() => {
  if (toggleCombo.value) {
    document.body.addEventListener("keydown", onKeydown)
  }
  toggleEventListener(enabled.value)

  // Expose public methods to global
  ;(window as any).__VUE_INSPECTOR__ = { enable, disable, openInEditor }
})

onUnmounted(() => {
  if (toggleCombo.value) {
    document.body.removeEventListener("keydown", onKeydown)
  }
  toggleEventListener(false)
})
</script>

<template>
  <div v-bind="{ [KEY_IGNORE]: 'true' }">
    <ToggleButton
      v-if="containerVisible"
      :position="inspectorOptions.toggleButtonPos"
      :enabled="enabled"
      @click.prevent.stop="toggleEnabled"
    />
    <!-- Overlay -->
    <template v-if="overlayVisible && linkParams">
      <div
        ref="floatsRef"
        class="vue-inspector-floats vue-inspector-card"
        :class="[{ 'vue-inspector-animated': animation }]"
        :style="floatsStyle"
      >
        <div>{{ linkParams.title }}:{{ linkParams.line }}:{{ linkParams.column }}</div>
        <div class="tip">Click to go to the file</div>
      </div>
      <div
        class="vue-inspector-size-indicator"
        :class="[{ 'vue-inspector-animated': animation }]"
        :style="sizeIndicatorStyle"
      />
    </template>
  </div>
</template>

<style scoped>
.vue-inspector-card {
  font-family: Arial, Helvetica, sans-serif;
  padding: 5px 8px;
  border-radius: 4px;
  text-align: left;
  color: #e9e9e9;
  font-size: 14px;
  background-color: #42b883;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.vue-inspector-card .tip {
  font-size: 11px;
  opacity: 0.7;
}

.vue-inspector-floats {
  z-index: 2147483647;
  position: fixed;
  transform: translateX(-50%);
  pointer-events: none;
}

.vue-inspector-size-indicator {
  z-index: 2147483646;
  position: fixed;
  background-color: #42b88325;
  border: 1px solid #42b88350;
  border-radius: 5px;
  pointer-events: none;
}

.vue-inspector-animated {
  transition: all 0.1s ease-in;
}

@media (prefers-reduced-motion) {
  .vue-inspector-animated {
    transition: none !important;
  }
}
</style>
