// Temporary helper: run with `./node_modules/.bin/tsx migrate-create.mts <name>`
// Bypasses Payload CLI binary (CJS/ESM conflicts on Node v22 with lexical TLA)
// Delete this file after generating migrations.
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Pre-populate CJS module cache with a patched @next/env.
// loadEnv.js (inside payload/dist/bin) resolves @next/env to payload's NESTED copy
// at payload/node_modules/@next/env — not the top-level one. Both need the same fix:
// @next/env sets __esModule: true but no .default → tsx esbuild interop copies only
// enumerable props and skips .default → `import_env.default` is undefined at runtime.
const _req = createRequire(import.meta.url)
function patchNextEnv(id: string) {
  try {
    const m = _req(id)
    if (m && !m.default) {
      Object.defineProperty(m, 'default', { value: m, configurable: true, writable: true, enumerable: true })
    }
  } catch {}
}
patchNextEnv('@next/env')
patchNextEnv(resolve(process.cwd(), 'node_modules/payload/node_modules/@next/env'))

// Load env vars manually (no @next/env needed)
for (const file of ['.env.local', '.env']) {
  try {
    const lines = readFileSync(resolve(process.cwd(), file), 'utf-8').split('\n')
    for (const line of lines) {
      const m = line.match(/^([^=#\s][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {}
}

process.env.PAYLOAD_MIGRATING = 'true'
const migrationName = process.argv[2] ?? 'initial'

// Dynamic imports run AFTER the @next/env patch is in place
const { getPayload } = await import('payload')
const { default: config } = await import('./src/payload.config.ts')

const payload = await getPayload({
  config,
  disableDBConnect: true,
  disableOnInit: true,
})

await payload.db.createMigration({
  file: undefined,
  forceAcceptWarning: true,
  migrationName,
  payload,
  skipEmpty: false,
})

process.exit(0)
