import { useSyncExternalStore } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ClientReleaseChange } from '@deepseek-ai/dsh-client-modules/client'
import { expect, it, vi } from 'vitest'
import { HostReleasePrompt } from '../src/client/HostReleasePrompt.tsx'
import { en, zh, type SettingsKey } from '../src/client/locales.ts'

vi.unmock('@deepseek-ai/dsh-client-ui-primitives')

const changed: ClientReleaseChange = {
  page: { version: '0.2.1-rc.1' }, previous: { version: '0.2.1-rc.1' }, host: { version: '0.2.1-rc.2' },
}

function fixture(copy: Record<SettingsKey, string> = en) {
  let snapshot: ClientReleaseChange | undefined
  const listeners = new Set<() => void>()
  const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
  const getSnapshot = () => snapshot
  function useReleaseChange<T>(selector: (change: ClientReleaseChange | undefined) => T): T {
    return selector(useSyncExternalStore(subscribe, getSnapshot, getSnapshot))
  }
  const publish = (value: ClientReleaseChange | undefined) => {
    snapshot = value
    for (const listener of listeners) listener()
  }
  const dismissRelease = vi.fn(() => { publish(undefined) })
  const reloadPage = vi.fn()
  const view = render(<HostReleasePrompt useReleaseChange={useReleaseChange}
    dismissRelease={dismissRelease} reloadPage={reloadPage} t={key => copy[key]} />)
  return { view, publish: (value: ClientReleaseChange | undefined) => { act(() => { publish(value) }) }, dismissRelease, reloadPage }
}

it('stays hidden until a release changes and never reloads automatically', () => {
  const b = fixture()
  expect(screen.queryByRole('dialog')).toBeNull()
  b.publish(changed)
  expect(screen.getByRole('dialog', { name: en['hostRelease.title'] })).toBeDefined()
  expect(screen.getByText(en['hostRelease.description'])).toBeDefined()
  expect(screen.getAllByText('0.2.1-rc.1')).toHaveLength(2)
  expect(screen.getAllByText('0.2.1-rc.2')).toHaveLength(2)
  expect(document.activeElement?.textContent).toBe(en['hostRelease.later'])
  expect(b.reloadPage).not.toHaveBeenCalled()
  expect(b.dismissRelease).not.toHaveBeenCalled()
  b.publish(undefined)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(b.reloadPage).not.toHaveBeenCalled()
})

it('dismisses without reload through the safe default button and Escape', () => {
  const b = fixture()
  b.publish(changed)
  fireEvent.click(screen.getByText(en['hostRelease.later']))
  expect(b.dismissRelease).toHaveBeenCalledOnce()
  expect(screen.queryByRole('dialog')).toBeNull()
  b.publish(changed)
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(b.dismissRelease).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(b.reloadPage).not.toHaveBeenCalled()
})

it('reloads only on the explicit reload button and supports Chinese copy', () => {
  const b = fixture(zh)
  b.publish(changed)
  expect(screen.getByRole('dialog', { name: zh['hostRelease.title'] })).toBeDefined()
  expect(b.reloadPage).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: zh['hostRelease.reload'] }))
  expect(b.reloadPage).toHaveBeenCalledOnce()
  expect(b.dismissRelease).not.toHaveBeenCalled()
})

it('shows commit changes for equal versions and names unknown releases', () => {
  const b = fixture()
  b.publish({ page: { version: 'same', commit: 'old' }, previous: { version: 'same', commit: 'previous' }, host: { version: 'same', commit: 'new' } })
  expect(screen.getByText('old')).toBeDefined()
  expect(screen.getByText('previous')).toBeDefined()
  expect(screen.getAllByText('new')).toHaveLength(2)
  b.publish({ page: undefined, previous: undefined, host: { version: 'next' } })
  expect(screen.getAllByText(en['hostRelease.unknown'])).toHaveLength(2)
  expect(screen.getAllByText('next')).toHaveLength(2)
  expect(b.reloadPage).not.toHaveBeenCalled()
})
