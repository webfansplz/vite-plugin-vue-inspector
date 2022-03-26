<template>
  <div>
    <h3>Hi</h3>
    <Render :render="supportSfcJsx" />
    <Render :render="a" />
  </div>
</template>
<script lang="tsx">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Hi",
  components: {
    Render: {
      props: {
        render: Function,
      },
      render() {
        return this.render()
      },
    },
  },
  setup() {
    return {
      supportSfcJsx: () => <h4>Support SFC Jsx</h4>,
      a: () => <h4>a</h4>,
    }
  },
})
</script>
<style lang="sass" scoped>
h3
  font-size: 26px
  color: #7390ff
  cursor: pointer
</style>
