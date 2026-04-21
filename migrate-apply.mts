// Run with: ./node_modules/.bin/tsx migrate-apply.mts
// Applies pending Payload migrations to the DB.
// Uses tsx CLI (not the Payload CLI binary) to avoid Node 22.22.x ESM/CJS symbol issues.
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

const { getPayload } = await import('payload')
const { default: config } = await import('./src/payload.config.ts')

const payload = await getPayload({ config, disableOnInit: true })

await payload.db.migrate()

process.exit(0)
