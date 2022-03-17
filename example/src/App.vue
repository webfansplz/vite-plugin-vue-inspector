<template>
  <div>
    <hello-world></hello-world>
    <div>3</div>
    <div>1</div>
    <div>hello world</div>
    <div @click="open">
      Vite is awesome
    </div>
  </div>
</template>
<script>
import queryString from "querystring"
import HelloWorld from "./HelloWorld.vue"
export default {
  components: {
    HelloWorld,
  },
  setup() {
    function open() {
      fetch(
        `/__open-stack-frame-in-editor?${queryString.stringify({
          fileName:
            "/example/src/App.vue",
          lineNumber: 6,
          colNumber: 5,
        })}`,
      )
    }
    return {
      open,
    }
  },
}
</script>
<style>
.a {
  font-size: 12px;
}
</style>
