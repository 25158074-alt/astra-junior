import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const failures = []
const check = (condition, label) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`); if (!condition) failures.push(label) }
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

await page.goto(base, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('astraJuniorProgress', JSON.stringify({ version: 1, currentLevel: 4, unlockedThrough: 10, completedLevels: [1, 2, 3], badges: ['Systems Spotter', 'Mission Preparer', 'Resource Planner'], phase: 'welcome' }))
})
await page.reload({ waitUntil: 'networkidle' })
await page.click('[data-action="continue-demo"]')
await page.waitForTimeout(300)

// Decision mission (Level 4).
await page.click('[data-level="4"]')
await page.waitForTimeout(250)
await page.locator('[data-decision]').first().click()
await page.waitForTimeout(200)
check(await page.locator('[data-explanation]').count() === 1, 'level 4 shows the explanation field')
check(await page.locator('.starter-row').count() === 1, 'level 4 offers reasoning starters')
await page.fill('[data-explanation]', 'I kept life support online first because the crew cannot wait for heat.')
await page.click('[data-action="confirm-decision"]')
await page.waitForTimeout(250)
check(await page.locator('.outcome-card').count() === 1, 'level 4 confirms a command decision and shows an outcome')

// Spacesuit mission (Level 2).
await page.click('[data-level="2"]')
await page.waitForTimeout(250)
for (const id of ['oxygen-tank', 'radiation-shield', 'thermal-layer', 'comms-unit', 'tool-kit']) {
  await page.click(`[data-gear="${id}"]`)
}
await page.fill('[data-explanation]', 'I kept the crew safe with the four essentials and brought tools for repairs.')
await page.click('[data-action="confirm-loadout"]')
await page.waitForTimeout(250)
const suitOutcome = await page.locator('.outcome-card').count()
check(suitOutcome === 1, 'level 2 completes a suit loadout with an outcome')
check((await page.locator('.outcome-card').innerText()).includes('MISSION BADGE') || (await page.locator('.outcome-card').innerText()).includes('RECOVERY'), 'level 2 outcome is presented as a badge or recovery step')

// Mission kit (Level 3).
await page.click('[data-level="3"]')
await page.waitForTimeout(250)
const kitIds = await page.evaluate(() => {
  const ui = window.__astra.ui
  const level = ui.activeLevel()
  const required = [...(level.essentialSupplies ?? [])]
  const backup = ['batteries', 'spare-filters'].find(id => (level.supplies ?? []).some(item => item.id === id))
  const chosen = [...required, ...(backup ? [backup] : [])]
  const items = level.supplies ?? []
  const totals = chosen.reduce((acc, id) => {
    const item = items.find(entry => entry.id === id)
    return item ? { mass: acc.mass + item.weightKg, storage: acc.storage + item.storageUnits } : acc
  }, { mass: 0, storage: 0 })
  return { chosen, mass: totals.mass, storage: totals.storage, massLimit: level.massLimitKg, storageLimit: level.storageLimit }
})
check(kitIds.mass <= kitIds.massLimit && kitIds.storage <= kitIds.storageLimit, `kit selection fits capacity (${kitIds.mass}kg, ${kitIds.storage} units)`)
for (const id of kitIds.chosen) await page.click(`[data-supply="${id}"]`)
await page.fill('[data-explanation]', 'I packed the essentials and a backup because a system could fail later.')
await page.click('[data-action="confirm-kit"]')
await page.waitForTimeout(250)
check(await page.locator('.outcome-card').count() === 1, 'level 3 secures a kit and shows an outcome')
check((await page.locator('.feedback-strip').innerText()).length > 10, 'level 3 gives consequence feedback')

check(errors.length === 0, `no browser errors (${errors.slice(0, 2).join(' | ')})`)
await browser.close()
console.log(failures.length ? `\n${failures.length} FAILURES` : '\nALL FLOWS PASSED')
if (failures.length) process.exit(1)
