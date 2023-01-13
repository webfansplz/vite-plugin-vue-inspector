import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Welcome',
  setup() {
    const text = 'Welcome to here 🚀 .'
    return () => <p style={{ color: '#fcb80f', cursor: 'pointer' }}> {text} </p>
  },
})
