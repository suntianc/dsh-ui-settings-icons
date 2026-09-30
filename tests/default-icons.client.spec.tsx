import { render } from '@testing-library/react'
import { it, expect } from 'vitest'
import { getDefaultNavIcon } from '../src/client/icons/default-icons.tsx'

it.each(['codex-auth', 'codex', 'openai', 'antigravity-auth', 'antigravity', 'gemini'])('renders a theme-inheriting custom icon for %s', id => {
  const { container, rerender } = render(<div data-theme="light">{getDefaultNavIcon(id, 'custom-icon')}</div>)
  const svg = container.querySelector('svg')!
  expect(svg.getAttribute('width')).toBe('16')
  expect(svg.getAttribute('class')).toContain('custom-icon')
  expect(svg.getAttribute('fill')).toBe('currentColor')
  const markup = svg.outerHTML
  rerender(<div data-theme="dark">{getDefaultNavIcon(id, 'custom-icon')}</div>)
  expect(container.querySelector('svg')?.outerHTML).toBe(markup)
})

it.each([
  ['general', 'settings'], ['unknown', 'settings'], ['models', 'models'],
  ['agent-presets', 'agent-presets'], ['plugins', 'plugins'],
])('selects the public rc2 primitive for %s', (id, icon) => {
  const element = getDefaultNavIcon(id, 'custom-icon')
  expect(element.props).toMatchObject({ size: 16, className: 'custom-icon' })
  const { container } = render(element)
  expect(container.querySelector('[data-icon]')?.getAttribute('data-icon')).toBe(icon)
})
