import inspectorOptions from 'virtual:vue-inspector-options'

function load() {
  if (typeof window === 'undefined') return

  void import('virtual:vue-inspector-path:client/overlay.ts')
}

if (inspectorOptions.lazyLoad) setTimeout(load, inspectorOptions.lazyLoad)
else load()
