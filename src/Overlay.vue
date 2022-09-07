<template>
  <div>
    <!-- toggle button -->
    <div
      v-if="controllerVisible"
      class="vue-inspector__controller"
      :class="{disabled: !enabled}"
      :style="controllerStyle"
      @click="toggle"
    >
      <img
        ref="target"
        src="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/main/docs/images/logo.png?raw=true"
        alt="logo"
        draggable="false"
      />
    </div>

    <!-- overlay -->
    <ul
      v-if="overlayVisible"
      ref="overlayTarget"
      class="vue-inspector__overlay"
      :style="overlayStyle"
    >
      <li>
        file: <em>{{ `<${linkQuery.title}>` }}</em>
      </li>
      <li>
        line: <em>{{ linkQuery.line }}</em>
      </li>
      <li>
        column: <em>{{ linkQuery.column }}</em>
      </li>
    </ul>
  </div>
</template>

<script>
import inspectorOptions from "virtual:vue-inspector-options"

const isClient = typeof window !== "undefined"
const importMetaUrl = isClient ? new URL(import.meta.url) : {}
const protocol = inspectorOptions.serverOptions?.https ? "https:" : importMetaUrl?.protocol
const hostOpts = inspectorOptions.serverOptions?.host
const host = hostOpts && hostOpts !== true ? hostOpts : importMetaUrl?.hostname
const port = inspectorOptions.serverOptions?.port ?? importMetaUrl?.port
const baseUrl = isClient ? `${protocol}//${host}:${port}` : ""

export default {
  data() {
    return {
      target: null,
      overlayTarget: null,
      enabled: inspectorOptions.enabled,
      toggleCombo: inspectorOptions.toggleComboKey?.toLowerCase().split("-"),
      overlayVisible: false,

      linkQuery: {
        file: "",
        line: 0,
        column: 0,
      },
      position: {
        x: 0,
        y: 0,
      },

      // drag control
      controlPosition: {
        x: 0,
        y: 0,
      },
      pressedDelta: undefined,
    }
  },
  computed: {
    controllerVisible() {
      const { toggleButtonVisibility } = inspectorOptions
      return toggleButtonVisibility === "always" || (toggleButtonVisibility === "active" && this.enabled)
    },
    controllerStyle() {
      return inspectorOptions.toggleButtonPos
        .split("-")
        .map(p => `${p}: 15px;`)
        .join("")
    },
    overlayStyle() {
      return {
        left: `${
          this.position.x - this.$refs.overlayTarget?.clientWidth / 2 || 0
        }px`,
        top: `${this.position.y + 20}px`,
      }
    },
  },
  mounted() {
    this.toggleCombo && document.body.addEventListener("keydown", this.onKeydown)
    this.enabled && this.enable()
  },
  methods: {
    toggleEvent() {
      const listener = this.enabled ? document.body.addEventListener : document.body.removeEventListener
      listener?.("mousemove", this.onMouseMove)
      listener?.("click", this.onFetch, true)
    },
    enable() {
      this.enabled = true
      this.toggleEvent()
    },
    disable() {
      this.enabled = false
      this.overlayVisible = false
      this.toggleEvent()
    },
    toggle() {
      this.enabled ? this.disable() : this.enable()
    },
    isKeyActive(key, event) {
      switch (key) {
        case "shift":
        case "control":
        case "alt":
        case "meta":
          return event.getModifierState(key.charAt(0).toUpperCase() + key.slice(1))
        default:
          return key === event.key.toLowerCase()
      }
    },
    onKeydown(event) {
      if (event.repeat || event.key === undefined)
        return

      const isCombo = this.toggleCombo?.every(key => this.isKeyActive(key, event))
      if (isCombo)
        this.toggle()
    },

    getTargetNode(e) {
      const path = e.path ?? e.composedPath()
      const targetNode = path?.find(node => node?.hasAttribute?.("data-v-inspector-file"))
      if (targetNode === this.$refs.target) {
        return {
          targetNode: null,
          params: null,
        }
      }
      return {
        targetNode,
        params: targetNode
          ? {
            file: targetNode?.getAttribute?.("data-v-inspector-file"),
            line: targetNode?.getAttribute?.("data-v-inspector-line"),
            column: targetNode?.getAttribute?.("data-v-inspector-column"),
            title: targetNode?.getAttribute?.("data-v-inspector-title"),
          }
          : null,
      }
    },
    onFetch(e) {
      if (e.target === this.$refs.target) return
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      const { targetNode, params } = this.getTargetNode(e)
      if (!targetNode) return
      const { file, line, column } = params
      this.overlayVisible = false
      fetch(
        `${baseUrl}/__open-stack-frame-in-editor?file=${file}&line=${line}&column=${column}`,
        {
          mode: "no-cors",
        },
      )
    },
    onMouseMove(e) {
      const { targetNode, params } = this.getTargetNode(e)
      if (targetNode) {
        this.position.x = e.clientX
        this.position.y = e.clientY
        this.overlayVisible = true
        this.linkQuery = params
      }
      else {
        this.overlayVisible = false
        this.linkQuery = {
          file: "",
          line: 0,
          column: 0,
        }
      }
    },
  },
}
</script>
<style scoped>
.vue-inspector__controller {
  cursor: pointer;
  position: fixed;
  text-align: center;
  z-index: 100000;
  width: 60px;
  height: 60px;
  background-color: #fff;
  border: 2px solid #29a8f2;
  border-radius: 50%;
}
.vue-inspector__controller img {
  width: 50px;
  margin: 0 auto;
}

.vue-inspector__controller:hover {
  background-color: #29a8f2;
}
.vue-inspector__controller.disabled {
  border: 2px dashed #ccc;
}

.vue-inspector__controller.disabled:hover {
  background-color: #ccc;
}
.vue-inspector__controller.disabled img {
  opacity: 0.5;
}

.vue-inspector__overlay {
  z-index: 100000;
  position: fixed;
  border: 2px dashed #666;
  background-color: rgba(0,0,0,0.8);
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
}

.vue-inspector__overlay  li {
  list-style-type: none;
}

.vue-inspector__overlay em {
  font-style: normal;
  font-weight: 500;
}
</style>
