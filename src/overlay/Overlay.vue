<template>
  <div>
    <!-- switch control -->
    <div
      class="vue-inspector-control"
      :style="controlStyle"
      :class="{'disabled': disabled}"
      @dblclick.stop="toggleControl"
    >
      <img
        id="vueInspectorControl"
        ref="target"
        src="https://github.com/webfansplz/article/blob/master/vvv-logo.png?raw=true"
        alt="logo"
        draggable="false"
      />
    </div>

    <!-- overlay -->
    <ul
      v-if="overlayVisible"
      ref="overlayTarget"
      class="vue-inspector-overlay"
      :style="overlayStyle"
    >
      <li>file: <em>{{ navigationParams.file }}</em></li>
      <li>line: <em>{{ navigationParams.line }}</em></li>
      <li>column: <em>{{ navigationParams.column }}</em></li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      target: null,
      overlayTarget: null,
      disabled: false,
      overlayVisible: false,

      navigationParams: {
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
    controlStyle() {
      const left = this.controlPosition.x || window.clientWidth
      const top = this.controlPosition.y || 20
      return `left:${left}px;top:${top}px;`
    },
    overlayStyle() {
      return ({
        left: `${this.position.x - (this.$refs.overlayTarget?.clientWidth / 2) || 0}px`,
        top: `${this.position.y + 20}px`,
      })
    },
  },
  mounted() {
    this.$refs.target.addEventListener("pointerdown", this.dragStart, true)
    window.addEventListener("pointermove", this.dragMove, true)
    window.addEventListener("pointerup", this.dragEnd, true)

    window.addEventListener("dblclick", this.onFetch)
    window.addEventListener("mousemove", this.onMouseMove)
  },
  methods: {
    dragStart(e) {
      e.stopPropagation()
      if (e.target !== this.$refs.target)
        return
      const rect = this.$refs.target?.getBoundingClientRect()
      const pos = {
        x: e.pageX - rect.left,
        y: e.pageY - rect.top,
      }
      this.pressedDelta = pos
    },
    dragMove(e) {
      if (!this.pressedDelta)
        return
      this.controlPosition = {
        x: e.pageX - this.pressedDelta.x,
        y: e.pageY - this.pressedDelta.y,
      }
    },
    dragEnd() {
      if (!this.pressedDelta)
        return
      this.pressedDelta = undefined
    },

    toggleControl() {
      this.disabled = !this.disabled
    },
    getTargetNode(e) {
      const path = e.path ?? e.composedPath()
      const targetNode = path?.find(node => node?.hasAttribute?.("v_file"))
      if (targetNode?.id === "vueInspectorControl") {
        return {
          targetNode: null,
          params: null,
        }
      }
      return {
        targetNode,
        params: targetNode
          ? {
            file: targetNode?.getAttribute?.("v_file"),
            line: targetNode?.getAttribute?.("v_line"),
            column: targetNode?.getAttribute?.("v_column"),
          }
          : null,
      }
    },
    onFetch(e) {
      e.preventDefault()
      if (this.disabled) return
      const { targetNode, params } = this.getTargetNode(e)
      if (!targetNode) return
      const { file, line, column } = params
      fetch(
        `/__open-stack-frame-in-editor?file=${file}&line=${line}&column=${column}`,
      )
      this.overlayVisible = false
    },
    onMouseMove(e) {
      if (this.disabled) return
      const { targetNode, params } = this.getTargetNode(e)
      if (targetNode) {
        this.position.x = e.pageX
        this.position.y = e.pageY
        this.overlayVisible = true
        this.navigationParams = params
      }
      else {
        this.overlayVisible = false
        this.navigationParams = {
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
.vue-inspector-control {

    cursor: pointer;
    position: fixed;
    text-align: center;
    right: 20px;
    top: 20px;
    z-index: 100000;
    width: 90px;
    height: 90px;
    background-color: #fff;
    border: 2px solid #29a8f2;
    border-radius: 50%;
}
.vue-inspector-control img {
  width: 80px;
}

.vue-inspector-control:hover {
  background-color: #29a8f2;
}
.vue-inspector-control.disabled {
    border: 2px dashed #ccc;
}

.vue-inspector-control.disabled:hover {
  background-color: #ccc;
}
.vue-inspector-control.disabled img {
  opacity: 0.5;
}

.vue-inspector-overlay {
  position: fixed;
  border: 2px dashed #ccc;
  background-color: #29a8f2;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
}

.vue-inspector-overlay em {
  font-style: normal;
  font-weight: 500;
}
</style>
