
<p align="center">
<a href="https://github.com/webfansplz/vite-plugin-vue-inspector"><img src="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/main/docs/images/logo.png" alt="vite-plugin-vue-inspector"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-inspector" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-inspector" alt="NPM Downloads" /></a>
  <a href="https://github.com/webfansplz/vite-plugin-vue-inspector/blob/master/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/webfansplz/vite-plugin-vue-inspector" alt="License" /></a>
</p>

<p align="center">
<a href="https://stackblitz.com/edit/vitejs-vite-te3qgo?file=vite.config.ts&terminal=dev"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>
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
// for Vue2

import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [
    createVuePlugin(),
    Inspector({
      vue: 2
    }),
  ],
})
```

```ts
// for Vue3

import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Inspector from "vite-plugin-vue-inspector"

export default defineConfig({
  plugins: [Vue(), Inspector()],
})
```

```ts
// for Nuxt3
// nuxt.config.ts

import { defineNuxtConfig } from 'nuxt'
import Inspector from "vite-plugin-vue-inspector"

export default defineNuxtConfig({
  vite: {
    plugins:[
      Inspector({
        appendTo: "entry.mjs"
      })
    ]
  }
})

```

### Options


```ts
interface VitePluginInspectorOptions {
  /**
  * Vue version
  * @default 3
  */
  vue?: 2 | 3

  /**
   * Inspect with vue component
   * @default true
   */
  withComponent?: boolean

  /**
  * Default enable state
  * @default false
  */
  enabled?: boolean

  /**
  * Define a combo key to toggle inspector
  * @default 'control-shift' on windows, 'meta-shift' on other os
  *
  * any number of modifiers `control` `shift` `alt` `meta` followed by zero or one regular key, separated by -
  * examples: control-shift, control-o, control-alt-s  meta-x control-meta
  * Some keys have native behavior (e.g. alt-s opens history menu on firefox).
  * To avoid conflicts or accidentally typing into inputs, modifier only combinations are recommended.
  */
  toggleComboKey?: string

  /**
  * Toggle button visibility
  * @default 'active'
  */
  toggleButtonVisibility?: "always" | "active" | "never"

  /**
  * Toggle button display position
  * @default top-right
  */
  toggleButtonPos?: "top-right" | "top-left" | "bottom-right" | "bottom-left"

  /**
  * append an import to the module id ending with `appendTo` instead of adding a script into body
  * useful for frameworks that do not support trannsformIndexHtml hook (e.g. Nuxt3)
  *
  * WARNING: only set this if you know exactly what it does.
  */
  appendTo?: string
}
```

### Example

- [Vue2](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/vue2)
- [Vue3](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/vue3)
- [Nuxt3](https://github.com/webfansplz/vite-plugin-vue-inspector/tree/main/example/nuxt)

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

- **[BREAKING CHANGE] From v1.0, `enabled` option default value changed from `true` to `false` .**
- It only work in develop mode .
- It does not currently support `Template Engine (e.g. pug)` .

## 🌸 Credits

This project is inspired by [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) .

Partially implementation is inspired by [vite-plugin-svelte-inspector](https://github.com/sveltejs/vite-plugin-svelte/tree/main/packages/vite-plugin-svelte/src/ui/inspector) .

## 🤖️ Analysis of Theory

[Chinese] [点击页面元素,这个Vite插件帮我打开了Vue组件](https://juejin.cn/post/7077347158545924127)
## 📄 License

[MIT LICENSE](./LICENSE)
