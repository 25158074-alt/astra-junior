import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const files = []
const ignored = new Set(['node_modules', 'dist', '.git'])
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(html|ts|js|json|css|md|yml|yaml|toml|env|txt)$/.test(entry.name)) files.push(full)
  }
}
walk(root)

const secretPatterns = [
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/,
  /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/,
  /(?:ghp|github_pat|xox[baprs]-)[A-Za-z0-9_-]{16,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /(?:OPENAI|ANTHROPIC|STRIPE|SUPABASE).{0,40}(?:KEY|TOKEN|SECRET|PASSWORD)\s*[:=]\s*['"][^'"]{12,}/i,
]
const forbiddenIntegrationPatterns = [/supabase/i, /service[_-]?role/i, /NEXT_PUBLIC_/i, /VITE_[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)/i]
const sourceFiles = files.filter(file => file !== path.join(root, 'scripts/security-audit.mjs') && (/\/(src|public|scripts)\//.test(file) || /\/index\.html$/.test(file)))
const findings = []
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of secretPatterns) if (pattern.test(text)) findings.push(`Potential secret pattern in ${path.relative(root, file)}`)
  for (const pattern of forbiddenIntegrationPatterns) if (pattern.test(text)) findings.push(`Potential privileged integration in ${path.relative(root, file)} (${pattern})`)
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
const requiredCspTokens = ["default-src 'self'", "script-src 'self'", "object-src 'none'", "base-uri 'none'"]
for (const token of requiredCspTokens) if (!index.includes(token)) findings.push(`Missing CSP token: ${token}`)

if (findings.length) {
  console.error('security-audit: FAIL')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}
console.log(`security-audit: OK — scanned ${sourceFiles.length} source/config files; no embedded secret patterns or privileged database integrations found; CSP baseline present.`)
