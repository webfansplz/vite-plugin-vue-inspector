<script lang="tsx">
import { defineComponent } from '@vue/composition-api'
import type { CreateElement } from 'vue'

export default defineComponent({
  name: 'Hi',
  components: {
    Render: {
      functional: true,
      props: {
        component: Function,
      },
      render(h: CreateElement, { props }: any) {
        return props.component(h)
      },
    },
  },
  setup() {
    return {
      boom: () => <h4 style="cursor: pointer;">🎉</h4>,
    }
  },
})
</script>

<template>
  <div>
    <h3>Hi</h3>
    <!--  -->
    <Render :component="boom" />
  </div>
</template>

<style lang="sass" scoped>
h3
  font-size: 26px
  color: #7390ff
  cursor: pointer
</style>
