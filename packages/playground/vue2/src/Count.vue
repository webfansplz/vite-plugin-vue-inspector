<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop() readonly message!: string
  @Prop({ default: 0 }) count!: number

  increment() {
    this.count++
  }
}
</script>

<template>
  <div>
    <p>Message: {{ message }}</p>
    <p>Count: {{ count }}</p>
    <button @click="increment">
      Increment
    </button>
  </div>
</template>
