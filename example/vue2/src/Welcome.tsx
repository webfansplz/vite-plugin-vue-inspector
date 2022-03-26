import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  name: "Welcome",
  setup() {
    return () => <p style="color: #fcb80f;cursor: pointer;"> Welcome to here 🚀 .</p>
  },
})
