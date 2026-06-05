import type { Emitter } from 'nanoevents'
import type { ElementTraceInfo } from './record'
import { createNanoEvents } from 'nanoevents'
import { customRef, ref, shallowRef } from 'vue'
import { findTraceAtPointer, getInternalStore } from './record'

export * from './record'

const KEY_IGNORE = 'data-v-inspector-ignore'

export const lastMatchedElement = shallowRef<ElementTraceInfo | undefined>()

export interface Events {
  hover: (info: ElementTraceInfo | undefined, event: MouseEvent | PointerEvent) => void
  click: (info: ElementTraceInfo, event: MouseEvent | PointerEvent) => void
  enabled: () => void
  disabled: () => void
}

const store = getInternalStore() as ReturnType<typeof getInternalStore> & {
  events?: Emitter<Events>
}

export const events: Emitter<Events> = (store.events ||= createNanoEvents<Events>())

export const isEnabled = customRef<boolean>(() => {
  const value = ref(false)

  return {
    get() {
      return value.value
    },
    set(newValue) {
      if (newValue === value.value) return
      value.value = newValue
      events.emit(newValue ? 'enabled' : 'disabled')
    },
  }
})

function isIgnoredEvent(event: Event): boolean {
  const target = event.target
  return target instanceof Element && Boolean(target.closest(`[${KEY_IGNORE}]`))
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointermove', (event) => {
    if (!isEnabled.value) return
    if (isIgnoredEvent(event)) return

    const result = findTraceAtPointer({ x: event.clientX, y: event.clientY })
    if (result?.el === lastMatchedElement.value?.el) return
    lastMatchedElement.value = result
    events.emit('hover', result, event)
  })

  document.addEventListener(
    'click',
    (event) => {
      if (!isEnabled.value) return
      if (isIgnoredEvent(event)) return

      const result = findTraceAtPointer({ x: event.clientX, y: event.clientY })
      if (!result) return

      events.emit('click', result, event)
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    },
    true,
  )
}
