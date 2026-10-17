/** Execute the emitted client factory in a browser-only global scope over the real renderer. */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('./vitest.mjs', import.meta.resolve('vitest/package.json'))), 'run',
  'tests/real-renderer.client.spec.tsx', '-t', 'shipped browser bundle',
], { stdio: 'inherit', env: { ...process.env, DSH_TEST_BUILT_CLIENT: '1' } })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
