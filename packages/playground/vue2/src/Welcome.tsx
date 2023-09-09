// import { defineComponent } from "@vue/composition-api"

// export default defineComponent({
//   name: "Welcome",
//   setup() {
//     return () => <p style="color: #fcb80f;cursor: pointer;"> Welcome to here 🚀 .</p>
//   },
// })

import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class Welcome extends Vue {
  private count = 0

  private get message(): string {
    return `Count: ${this.count}`
  }

  private increment(): void {
    this.count++
  }

  render() {
    return (
      <div>
        <h1>{this.message}</h1>
        <button onClick={this.increment}>Increment</button>
      </div>
    )
  }
}
