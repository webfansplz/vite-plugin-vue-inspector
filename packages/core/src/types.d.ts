declare module 'virtual:vue-inspector-options' {
  const options: import('./index').VitePluginInspectorOptions & {
    base: string
  }
  export default options
}
