import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  esbuildOptions(options) {
    if (options.format === 'cjs')
      options.outExtension = { '.js': '.cjs' }
  },
  shims: true,
  entry: [
    'src/index.ts',
  ],
})
