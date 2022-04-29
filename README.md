
<p align="center">
<a href="https://github.com/webfansplz/vite-plugin-vue-inspector"><img src="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/main/docs/images/logo.png" alt="vite-plugin-vue-inspector"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-inspector" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-inspector" alt="NPM Downloads" /></a>
  <a href="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/master/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/webfansplz/vite-plugin-vue-inspector" alt="License" /></a>
</p>

## 📖 Introduction

A vite plugin which provides the ability that to jump to the local IDE when you click the element of browser automatically. It supports Vue2 & 3 & SSR.

<p align="center">
<img src="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/main/docs/images/vite-plugin-vue-inspector.gif" alt="vite-plugin-vue-inspector">
</p>

## 📦 Installation

```bash
# pnpm 
pnpm install vite-plugin-vue-inspector -D

# yarn
yarn add vite-plugin-vue-inspector -D

# npm
npm install vite-plugin-vue-inspector -D
```

## 🦄 Usage

### Configuration Vite

```ts
// for vue2

import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [
    createVuePlugin(),
    Inspector({
      vue: 2,
    }),
  ],
})
```

```ts
// for vue3

import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [Vue(), Inspector()],
})
```

```ts
// for nuxt
// nuxt.config.ts

import { defineNuxtConfig } from 'nuxt'
import Inspector from "vite-plugin-vue-inspector"

export default defineNuxtConfig({
  vite: {
    plugins:[
      Inspector()
    ]
  }
})

```

### [Nuxt3 Usage](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/nuxt)

```ts
// App.vue

<template>
  <inspector-overlay v-if="isDev"/>
</template>

<script lang="ts">

import InspectorOverlay from "vite-plugin-vue-inspector/overlay.vue"
export default {
  name: "App",
  components: {
    InspectorOverlay
  },
  setup(){
    return {
      isDev: process.dev
    }
  }
}

</script>
```


### Example

- [vue2](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/vue2)
- [vue3](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/vue3)
- [nuxt3](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/nuxt)

## 🔌  Configuration IDE / Editor

It uses an **environment variable** named **`VUE_EDITOR`** to specify an IDE application, but if you do not set this variable, it will try to open a common IDE that you have open or installed once it is certified.

For example, if you want it always open VSCode when inspection clicked, set `export VUE_EDITOR=code` in your shell.


### VSCode

- install VSCode command line tools, [see the official docs](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line)
  ![install-vscode-cli](https://github.com/webfansplz/vite-plugin-vue-inspector/blob/main/docs/images/install-vscode-cli.png)

- set env to shell, like `.bashrc` or `.zshrc`  

  ```bash
  export VUE_EDITOR=code
  ```

<br />

### WebStorm  

- just set env with an absolute path to shell, like `.bashrc` or `.zshrc` (only MacOS)  

  ```bash
  export VUE_EDITOR='/Applications/WebStorm.app/Contents/MacOS/webstorm'
  ```

**OR**

- install WebStorm command line tools

- then set env to shell, like `.bashrc` or `.zshrc`  

  ```bash
  export VUE_EDITOR=webstorm
  ```

<br />

### Vim

Yes! you can also use vim if you want, just set env to shell

```bash
export VUE_EDITOR=vim
```

<br />

## 💡 Notice

- It does not currently support `SSR` and `Template Engine (e.g. pug)` .

## 🌸 Thanks

This project is inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) .

## 🤖️ Analysis of Theory

[Chinese] [点击页面元素,这个Vite插件帮我打开了Vue组件](https://juejin.cn/post/7077347158545924127)
## 📄 License

[MIT LICENSE](./LICENSE)
