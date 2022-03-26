<template>
  <div>
    <h3>Hi</h3>
    <Render :render="supportSfcJsx" />
  </div>
</template>
<script lang="tsx">
import { defineComponent } from "@vue/composition-api"
import { CreateElement } from "vue"

export default defineComponent({
  name: "Hi",
  components: {
    Render: {
      functional: true,
      props: {
        render: Function,
      },
      render(h: CreateElement, { props }: any) {
        return props.render(h)
      },
    },
  },
  setup() {
    return {
      supportSfcJsx: () => <h4>Support SFC Jsx</h4>,
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
