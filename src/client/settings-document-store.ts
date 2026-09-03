import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export interface SettingsDocumentState {
  status: 'idle' | 'loading' | 'ready' | 'unavailable'
  opening: boolean
  error: string | null
}

/** Derives local-document availability and invokes the current Host Remote operation. */
export class SettingsDocumentStore {
  readonly store = createSnapshotStore<SettingsDocumentState>({
    status: 'idle',
    opening: false,
    error: null,
  })

  private following?: (() => void) | undefined

  constructor(
    private readonly ctx: ClientContext,
    private readonly describeFace: SettingsDescribeFace,
  ) {}

  async load(): Promise<void> {
    this.following ??= this.describeFace.subscribe(() => {
      this.derive()
    })
    this.store.update((state) => {
      state.status = 'loading'
      state.error = null
    })
    await this.describeFace.ensure()
    this.derive()
  }

  async open(): Promise<void> {
    const current = this.store.getSnapshot()
    if (current.status !== 'ready' || current.opening) return
    this.store.update((state) => {
      state.opening = true
      state.error = null
    })
    try {
      const result = await this.ctx.remote.settings.openSettingsDocument()
      if (!result.ok) {
        this.store.update((state) => {
          state.error = result.error.message
        })
      }
    } catch (error) {
      this.store.update((state) => {
        state.error = messageOf(error)
      })
    } finally {
      this.store.update((state) => {
        state.opening = false
      })
    }
  }

  dispose(): void {
    this.following?.()
    this.following = undefined
  }

  private derive(): void {
    const mirrored = this.describeFace.getSnapshot()
    if (mirrored.view === undefined) {
      if (mirrored.error !== null) {
        this.store.update((state) => {
          state.status = 'unavailable'
          state.error = mirrored.error
        })
      }
      return
    }
    const { hasDocument } = mirrored.view
    this.store.update((state) => {
      state.status = hasDocument ? 'ready' : 'unavailable'
      state.error = null
    })
  }
}
