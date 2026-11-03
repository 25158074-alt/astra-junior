import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'

const base = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto(base, { waitUntil: 'networkidle' })
await page.click('[data-action="start-fresh"]')
await page.waitForTimeout(300)

// Junior Mode desktop view.
await page.click('.topbar [data-action="junior"]')
await page.waitForTimeout(300)
await page.screenshot({ path: 'release-desktop-junior.png', fullPage: false })

// Print sheet generation, with window.print stubbed so the headless browser does not block.
await page.evaluate(() => { window.print = () => { window.__printCalled = true } })
await page.click('[data-action="classroom"]')
await page.waitForSelector('#classroom-dialog[open]')
await page.click('[data-action="print-classroom"]')
await page.waitForTimeout(300)
const result = await page.evaluate(() => ({ called: window.__printCalled === true, sheet: document.getElementById('print-sheet')?.innerHTML.length ?? 0 }))
console.log('print called:', result.called, 'print sheet chars:', result.sheet)
if (!result.called || result.sheet < 2000) throw new Error('Print sheet was not generated')

await page.emulateMedia({ media: 'print' })
await page.pdf({ path: 'acceptance-classroom.pdf', format: 'A4', printBackground: true })
const text = execFileSync('pdftotext', ['acceptance-classroom.pdf', '-'], { encoding: 'utf8' })
console.log('PDF pages text sample:', text.slice(0, 160).replace(/\n+/g, ' | '))
for (const needle of ['CLASSROOM REPORT', 'Mission learning record', 'Readiness profile', 'Discussion prompts']) {
  if (!text.includes(needle)) throw new Error(`PDF is missing: ${needle}`)
}
await page.emulateMedia({ media: 'screen' })
await browser.close()
console.log('PRINT CHECK PASSED')
