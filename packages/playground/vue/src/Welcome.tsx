import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Welcome',
  setup() {
    const text = 'Welcome to here 🚀 .'
    return () =>
      h('p', { style: { color: '#fcb80f', cursor: 'pointer' } }, [
        text,
        text ? h('template', text) : null,
      ])
  },
})
