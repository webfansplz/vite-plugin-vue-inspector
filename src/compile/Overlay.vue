<template>
  <div>
    <div v-if="visible" class="overlay">
      hello world
    </div>
    <button @click="onToggle">
      toggle
    </button>
  </div>
</template>

<script>
import { ref } from "vue"
export default {
  setup() {
    const visible = ref(true)
    function onToggle() {
      visible.value = !visible.value
    }
    return {
      visible,
      onToggle,
    }
  },
}
</script>
<style scoped>
.overlay{
    position: fixed;
    right: 5px;
    top: 5px;
    width: 100px;
    height: 100px;
    background-color: #fff;
    color: #ff8000;
}
</style>
