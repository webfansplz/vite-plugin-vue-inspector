/// <reference types="vite/client" />

import type { DockClientScriptContext } from '@vitejs/devtools-kit/client'
import { events, isEnabled } from './listeners'
import { state } from './overlay'

const OPEN_IN_EDITOR_RPC = 'vite:core:open-in-editor'

export default function clientScriptSetup(ctx: DockClientScriptContext): void {
  let cleanupClick: (() => void) | undefined

  const deactivate = () => {
    cleanupClick?.()
    cleanupClick = undefined
    isEnabled.value = false
    state.isVisible = false
  }

  ctx.current.events.on('entry:activated', () => {
    cleanupClick?.()
    cleanupClick = events.on('click', async (info) => {
      await (ctx.rpc.call as (name: string, ...args: unknown[]) => Promise<unknown>)(
        OPEN_IN_EDITOR_RPC,
        info.fullpath,
      )
      deactivate()
      void ctx.docks.switchEntry(null)
    })
    isEnabled.value = true
  })

  ctx.current.events.on('entry:deactivated', () => {
    deactivate()
  })
}
