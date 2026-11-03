import { spawn, execFileSync } from 'node:child_process'

const port = 4800 + Math.floor(Math.random() * 100)
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'inherit' })
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { ready = (await fetch(origin)).ok; if (ready) break } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  if (!ready) throw new Error('preview server did not start')
  execFileSync(process.execPath, ['scripts/acceptance.mjs', origin], { stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/flow-check.mjs', origin], { stdio: 'inherit' })
  execFileSync(process.execPath, ['scripts/print-check.mjs', origin], { stdio: 'inherit' })
  console.log('verify: PASS — acceptance, mission flows, and classroom print checks completed')
} finally {
  server.kill('SIGTERM')
}
