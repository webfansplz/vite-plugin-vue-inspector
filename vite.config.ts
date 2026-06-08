import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    ignorePatterns: ['dist/**', 'packages/**/dist/**', 'packages/playground/**', 'public/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'no-console': 'off',
    },
  },
  fmt: {
    singleQuote: true,
    semi: false,
  },
  pack: {
    entry: {
      index: 'packages/core/src/index.ts',
      'client/record': 'packages/core/src/client/record.ts',
      'client/listeners': 'packages/core/src/client/listeners.ts',
      'client/overlay': 'packages/core/src/client/overlay.ts',
      'client/vite-devtools': 'packages/core/src/client/vite-devtools.ts',
    },
    outDir: 'packages/core/dist',
    format: ['esm'],
    dts: true,
    clean: true,
    deps: {
      onlyBundle: false,
      neverBundle: [
        '@vue/compiler-dom',
        '@vitejs/devtools-kit',
        '@vitejs/devtools-kit/client',
        'vite',
        'vue',
        'virtual:vue-inspector-options',
      ],
    },
  },
})
