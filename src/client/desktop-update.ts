import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'

type Phase = 'idle' | 'checking' | 'available' | 'downloading' | 'verifying' | 'installing' | 'ready' | 'error'

export interface UpdatePresentation {
  phase: Phase
  version?: string
  percent?: number
  failure?: string
}

export interface UpdateView {
  presentation?: UpdatePresentation
  failed: boolean
  opening: boolean
}

interface UpdateBridge {
  status(): Promise<UpdatePresentation>
  open(): Promise<void>
  subscribe(listener: (state: UpdatePresentation) => void): () => void
}

/** Observe the public desktop preload once and share its status across both sidebar seats. */
export class DesktopUpdateSource {
  readonly store = createSnapshotStore<UpdateView>({ failed: false, opening: false })
  private live = true
  private received = false
  private readonly unsubscribe: (() => void) | undefined
  private readonly bridge: UpdateBridge | undefined

  constructor() {
    const carrier = (globalThis as typeof globalThis & {
      dshDesktop?: { protocolVersion: number; updates?: UpdateBridge }
    }).dshDesktop
    this.bridge = carrier?.protocolVersion === 1 ? carrier.updates : undefined
    this.unsubscribe = this.bridge?.subscribe((presentation) => {
      if (!this.live) return
      this.received = true
      this.store.set({ ...this.store.getSnapshot(), presentation, failed: false })
    })
    void this.bridge?.status().then((presentation) => {
      if (this.live && !this.received) this.store.set({ ...this.store.getSnapshot(), presentation })
    }, () => {
      if (this.live && !this.received) this.store.set({ ...this.store.getSnapshot(), failed: true })
    })
  }

  open(): void {
    const current = this.store.getSnapshot()
    if (!this.live || this.bridge === undefined || current.opening
      || ['checking', 'downloading', 'verifying', 'installing'].includes(current.presentation?.phase ?? '')) return
    this.store.set({ ...current, opening: true })
    void this.bridge.open().catch(() => {
      if (this.live) this.store.set({ ...this.store.getSnapshot(), failed: true })
    }).finally(() => {
      if (this.live) this.store.set({ ...this.store.getSnapshot(), opening: false })
    })
  }

  dispose(): void { this.live = false; this.unsubscribe?.() }
}
