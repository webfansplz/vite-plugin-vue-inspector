<!-- eslint-disable vue/one-component-per-file -->
<script lang="ts" setup>
import { defineComponent, h } from 'vue'

// Mock external import like this: import { Card, Title,Content } from '@ui-lib'
const Card = defineComponent({
  render() {
    return h('div', {
      style: 'border: 1px solid #eee;padding: 32px',
    }, this.$slots)
  },
})

const Title = defineComponent({
  render() {
    return h('div', {
      style: 'color: darkolivegreen',
    }, this.$slots)
  },
})

const Content = defineComponent({
  render() {
    return h('p', {
      style: 'color: darkseagreen',
    }, this.$slots)
  },
})
</script>

<template>
  <Card>
    <Title>External component</Title>
    <Content>content</Content>
  </Card>
</template>
