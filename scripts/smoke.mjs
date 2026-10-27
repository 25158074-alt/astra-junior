// Production HTTP smoke check for ASTRA Junior. Run after `pnpm build`.
// Checks the static entry, bundled UI/game content, styles and original favicon.
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'

const port = 4300 + Math.floor(Math.random() * 500)
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
const timeout = setTimeout(() => { server.kill('SIGTERM'); console.error('smoke: FAIL — timed out'); process.exit(1) }, 30_000)

async function get(path) {
  const response = await fetch(new URL(path, origin))
  assert.equal(response.status, 200, `GET ${path} returned HTTP ${response.status}`)
  return { response, text: await response.text() }
}

try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite preview exited (${server.exitCode})`)
    try { ready = (await fetch(origin)).ok; if (ready) break } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, 'preview server did not start')
  const { text: html } = await get('/')
  assert.match(html, /ASTRA Junior/)
  assert.match(html, /astra-favicon\.svg/)
  const script = html.match(/<script[^>]+src="([^"]+\.js)"/)
  const style = html.match(/<link[^>]+href="([^"]+\.css)"/)
  assert.ok(script, 'production JavaScript bundle link is missing')
  assert.ok(style, 'production CSS bundle link is missing')
  const assetFiles = (await readdir('dist/assets')).filter(file => file.endsWith('.js'))
  const jsPaths = [`/${script[1].replace(/^\//, '')}`, ...assetFiles.map(file => `/assets/${file}`)]
  const jsParts = await Promise.all([...new Set(jsPaths)].map(path => get(path).then(result => result.text)))
  const js = jsParts.join('\n')
  const { text: css } = await get(style[1])
  for (const required of ['MISSION CONTROL ONLINE', 'Welcome to Astronaut Training', 'Mission Commander Challenge', 'EXPLAIN YOUR DECISION', 'Mission readiness', 'Mission memory']) {
    assert.ok(js.includes(required), `game bundle is missing ${required}`)
  }
  for (const required of ['.astra-shell', '.scene-window', '.decision-reason', '.skill-radar', 'prefers-reduced-motion']) {
    assert.ok(css.includes(required), `style bundle is missing ${required}`)
  }
  await get('/astra-favicon.svg')
  console.log('smoke: OK — ASTRA entry, game bundle, responsive styles, favicon and self-contained typography policy verified.')
} catch (error) {
  console.error(`smoke: FAIL — ${error?.message ?? String(error)}`)
  process.exitCode = 1
} finally {
  clearTimeout(timeout)
  server.kill('SIGTERM')
}
