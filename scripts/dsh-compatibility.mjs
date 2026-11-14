/** Minimum supported peer version and the exact development/source target. */
export const DSH_BASELINE = '0.2.2-rc.1'
export const DSH_SOURCE_VERSION = '0.2.2-rc.3'
export const DSH_SOURCE_COMMITS = {
  '0.2.2-rc.1': '66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db',
  '0.2.2-rc.3': '38a6a5c965aa99ab525161efb7cc5cf1fe62fced',
}
export const DSH_SOURCE_COMMIT = DSH_SOURCE_COMMITS[DSH_SOURCE_VERSION]
export const DSH_PEER_RANGE = '0.2.2-rc.1 || 0.2.2-rc.3'
export const DSH_EXPERIMENTAL_PEER_RANGE = '0.2.2-rc.3'
export const CORDIS_BASELINE = '4.1.0'
export const SCHEMASTERY_BASELINE = '3.19.0'
export const DSH_VERIFY_VERSION = process.env.DSH_VERIFY_VERSION ?? DSH_SOURCE_VERSION
if (![DSH_BASELINE, DSH_SOURCE_VERSION].includes(DSH_VERIFY_VERSION)) {
  throw new Error('Unsupported DSH verification version')
}

/** Read version identities from either registry or packed-source pnpm resolutions. */
export function resolvedDshPackages(lockfile) {
  const packages = lockfile.split('\npackages:\n', 2)[1]?.split('\nsnapshots:\n', 1)[0] ?? ''
  return [...packages.matchAll(/^ {2}['"](@deepseek-ai\/dsh-[^@'"]+)@([^'"]+)['"]:\n((?: {4}[^\n]*\n|\n)*)/gmu)]
    .map(([, name, reference, metadata]) => ({
      name,
      version: reference.startsWith('file:')
        ? /^ {4}version: (\S+)$/mu.exec(metadata)?.[1] ?? reference
        : reference,
    }))
}
