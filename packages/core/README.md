# vite-plugin-vue-inspector

Jump from a Vue element in the browser to its source file in your editor.

This package is Vue 3 and Vite only. It records source locations from Vue's compiled render output with Vite source maps, so it no longer injects visible `data-v-inspector` attributes into the DOM. The browser overlay is drawn by `client/overlay` with DOM/SVG APIs instead of a Vue SFC. It can also register itself as a Vite DevTools dock action through `@vitejs/devtools-kit`.

## Install

```bash
pnpm add -D vite-plugin-vue-inspector
```

## Vite

```ts
import Vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-vue-inspector'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [Vue(), Inspector()],
})
```

Press `Command+Shift` on macOS or `Ctrl+Shift` on Windows/Linux to toggle the inspector. Click a highlighted element to open the source location in your editor.

## Nuxt

Use the Vite plugin directly and append the client loader to Nuxt's entry module:

```ts
import Inspector from 'vite-plugin-vue-inspector'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  vite: {
    plugins: [
      Inspector({
        appendTo: /\/entry\.m?js$/,
      }),
    ],
  },
})
```

## Vite DevTools

Vite DevTools integration is enabled by default:

```ts
Inspector({
  viteDevtools: true,
})
```

When the dock action is activated, the inspector is enabled and editor opening goes through the Vite DevTools RPC.

## Options

```ts
interface VitePluginInspectorOptions {
  enabled?: boolean
  toggleComboKey?: string | false
  toggleButtonVisibility?: 'always' | 'active' | 'never'
  toggleButtonPos?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  appendTo?: string | RegExp
  lazyLoad?: number | false
  disableInspectorOnEditorOpen?: boolean
  launchEditor?: string
  reduceMotion?: boolean
  viteDevtools?: boolean
}
```

## Client API

The overlay exposes a browser control object:

```ts
window.__VUE_INSPECTOR__?.enable()
window.__VUE_INSPECTOR__?.disable()
window.__VUE_INSPECTOR__?.toggleEnabled()
```

Headless helpers are also available:

```ts
import {
  events,
  findTraceAtPointer,
  findTraceFromElement,
  isEnabled,
} from 'vite-plugin-vue-inspector/client/listeners'
```

To use the built-in DOM overlay directly:

```ts
if (import.meta.hot) import('vite-plugin-vue-inspector/client/overlay')
```

## Playgrounds

```bash
pnpm play:vue
pnpm play:nuxt
```
