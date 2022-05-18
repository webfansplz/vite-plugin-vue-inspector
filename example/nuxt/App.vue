<template>
  <div class="container">
    <div>
      <Hi />
      <p> Welcome to here 🚀 . </p>
      <!--  -->
      <!--  -->
      <!--  -->
      <p>Vite so awesome 🔥 .</p>
      <a href="https://github.com/webfansplz/vite-plugin-vue-inspector">Give me a star if it helps you 💗 .</a>
    </div>
  </div>
</template>
<script lang="ts">
import Hi from "./Hi.vue"
export default {
  name: "App",
  components: {
    Hi,
  },
}
</script>
<style lang="sass" scoped>
.container
  width: 100vw
  height: 100vh
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  display: flex
  align-items: center
  justify-content: center
p
  font-size: 18px
  color: #35495d
  cursor: pointer
</style>
