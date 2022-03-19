<template>
  <div class="container">
    <div>
      <Hi />
      <p>
        Welcome to here 🚀 .
      </p>
      <!--  -->
      <!--  -->
      <!--  -->
      <p>Vite so awesome 🔥 .</p>
      <a href="https://github.com/webfansplz/vite-plugin-vue-inspector">Give me a star if it helps you 💗 .</a>
    </div>
  </div>
</template>
<script>
import Hi from "./Hi.vue"
export default {
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
  cursor: pointer
  &:nth-of-type(1)
    color: #35495d
  &:nth-of-type(2)
    color: #fcb80f
</style>
