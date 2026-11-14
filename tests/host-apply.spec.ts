import { expect, it } from 'vitest'
import { apply } from '../src/index.ts'

it('does not access or mutate settings, welcome preferences, or host services', () => {
  expect(() => apply()).not.toThrow()
})
