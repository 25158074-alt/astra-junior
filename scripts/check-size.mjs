// Checks JavaScript budgets while reporting initial and deferred bundle size.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const MB = 1024 * 1024
const BUDGET = { js: 2.0 * MB, fonts: 2.2 * MB }
const walk = dir => readdirSync(dir).flatMap(name => {
  const p = join(dir, name)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
const files = walk('dist').map(path => {
  const raw = readFileSync(path)
  const text = /\.(js|css|html|json|svg)$/.test(path)
  return { path, size: raw.length, wire: text ? gzipSync(raw).length : raw.length }
})
const sum = pred => files.filter(pred).reduce((n, f) => n + f.wire, 0)
const jsFiles = files.filter(f => f.path.endsWith('.js'))
const js = jsFiles.reduce((n, f) => n + f.wire, 0)
const initialJs = jsFiles.filter(f => /index-[^/]+\.js$/.test(f.path)).reduce((n, f) => n + f.wire, 0)
const fonts = sum(f => /\.(ttf|woff2)$/.test(f.path))
const transfer = sum(f => !f.path.endsWith('.txt'))
const mb = n => `${(n / MB).toFixed(2)} MB`
console.log(`bundle (gzip): initial js ${mb(initialJs)} / all js ${mb(js)} / fonts ${mb(fonts)} / transfer ${mb(transfer)}`)
const over = Object.entries({ js, fonts }).filter(([k, v]) => v > BUDGET[k])
if (over.length) {
  for (const [k, v] of over) console.error(`over budget: ${k} ${mb(v)} > ${mb(BUDGET[k])}`)
  process.exit(1)
}
