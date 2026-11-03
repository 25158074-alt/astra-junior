/**
 * Browser acceptance pass for the ASTRA Junior release candidate.
 * Run against the production preview server: node scripts/acceptance.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const failures = []
const check = (condition, label) => {
  if (condition) console.log(`PASS  ${label}`)
  else { failures.push(label); console.log(`FAIL  ${label}`) }
}
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForSelector('.welcome-overlay.is-visible')
check(await page.locator('.welcome-overlay.is-visible').count() === 1, 'welcome overlay is visible on first load')
check(await page.locator('.junior-welcome-toggle').count() === 1, 'welcome screen offers Junior Mode')

await page.click('[data-action="start-fresh"]')
await page.waitForTimeout(400)
const levelCount = await page.locator('.level-button').count()
check(levelCount === 10, `sidebar renders all ten levels (${levelCount})`)
const locked = page.locator('.level-button.is-locked')
check(await locked.count() === 9, 'nine later missions start locked')
check((await locked.first().locator('small').textContent()) === 'COMPLETE PREVIOUS LEVEL', 'locked levels explain COMPLETE PREVIOUS LEVEL')
check(await locked.first().isDisabled(), 'locked level buttons are disabled')

// Complete level 1 through the real interface.
for (let index = 0; index < 6; index += 1) {
  const answer = await page.evaluate(() => {
    const ui = window.__astra.ui
    return ui.activeLevel().systemScenarios[ui.progress.quizIndex].answer
  })
  await page.click(`[data-system="${answer}"]`)
  if (await page.locator('[data-action="next-quiz"]').count()) await page.click('[data-action="next-quiz"]')
}
await page.waitForTimeout(300)
check(await page.locator('.outcome-card.outcome-pass').count() === 1, 'mission 1 reaches a passing outcome')
check((await page.locator('.badge-card').innerText()).includes('1 BADGE EARNED'), 'badge is awarded and shown')
check(await page.locator('.level-button.is-complete').count() === 1, 'completed mission is marked in the sidebar')

// Mission report + classroom report.
await page.click('[data-action="report"]')
await page.waitForSelector('#report-dialog[open]')
check((await page.locator('#report-dialog').innerText()).includes('MISSION MEMORY'), 'mission report opens with mission memory')
await page.click('#report-dialog [data-action="classroom"]')
await page.waitForSelector('#classroom-dialog[open]')
const classroomText = await page.locator('#classroom-dialog').innerText()
check(classroomText.includes('CLASSROOM REPORT'), 'classroom report opens')
check((await page.locator('.classroom-level').count()) === 10, 'classroom report lists all ten missions')
check((await page.locator('.classroom-stats > div').count()) === 4, 'classroom report shows four headline statistics')
check(classroomText.includes('Discussion prompts'), 'classroom report includes discussion prompts')
await page.screenshot({ path: 'acceptance-classroom.png', fullPage: false })
await page.click('#classroom-dialog [data-close]')

// Glossary search and filters.
await page.click('[data-action="glossary"]')
await page.waitForSelector('#glossary-dialog[open]')
const allTerms = await page.locator('.glossary-entry').count()
check(allTerms >= 20, `glossary lists terms (${allTerms})`)
await page.fill('[data-glossary-search]', 'radiat')
await page.waitForTimeout(150)
const filtered = await page.locator('.glossary-entry').count()
check(filtered > 0 && filtered < allTerms, `glossary search narrows results (${filtered})`)
check((await page.locator('.glossary-entry h3').first().innerText()).toLowerCase().includes('radiat'), 'search puts matching term first')
await page.fill('[data-glossary-search]', 'zzzz')
await page.waitForTimeout(150)
check(await page.locator('.glossary-empty').count() === 1, 'glossary shows an empty state')
await page.click('[data-action="glossary-reset"]')
await page.click('[data-glossary-category="Space weather"]')
await page.waitForTimeout(150)
const weatherTerms = await page.locator('.glossary-entry').count()
check(weatherTerms >= 4, `glossary category filter works (${weatherTerms} space-weather terms)`)
await page.screenshot({ path: 'acceptance-glossary.png' })
await page.click('#glossary-dialog [data-close]')

// Space weather notice.
const weatherPanel = await page.locator('[data-weather-panel]').innerText()
check(weatherPanel.includes('DONKI'), 'space weather panel references DONKI training')
await page.click('[data-action="space-weather"]')
await page.waitForSelector('#weather-dialog[open]')
const noticeText = await page.locator('#weather-dialog').innerText()
check(noticeText.includes('not live NASA data'), 'space weather notice carries the simulation disclaimer')
check(noticeText.includes('What DONKI teaches'), 'space weather notice explains DONKI')
await page.screenshot({ path: 'acceptance-weather.png' })
await page.click('#weather-dialog [data-close]')

// Junior Mode: toggle, hints, starters, persistence.
await page.click('.topbar [data-action="junior"]')
await page.waitForTimeout(250)
check(await page.locator('.astra-shell.junior-mode').count() === 1, 'Junior Mode applies to the shell')
check(await page.locator('.junior-hint').count() === 1, 'Junior Mode adds a plain-language hint')
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('game3d.save') ?? '{}'))
check(saved.juniorMode === true, 'Junior Mode is saved in browser settings')
await page.click('[data-action="continue"]')
await page.waitForTimeout(300)
check(await page.locator('.starter-chip').count() > 0, 'Junior Mode shows reasoning sentence starters')
const before = await page.locator('[data-explanation]').inputValue()
await page.locator('.starter-chip').first().click()
const after = await page.locator('[data-explanation]').inputValue()
check(after.length > before.length, 'sentence starter inserts text into the explanation')

// Save and restore across a reload.
await page.waitForTimeout(300)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
check(await page.locator('.astra-shell.junior-mode').count() === 1, 'Junior Mode survives a reload')
const levelTwoProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('astraJuniorProgress') ?? '{}'))
check(levelTwoProgress.completedLevels?.includes(1), 'completed mission is restored from local storage')

// Space weather panel must follow the level.
await page.evaluate(() => window.__astra.ui.render())
const levelTwoWeather = await page.locator('[data-weather-panel]').innerText()
check(levelTwoWeather.includes('Solar energetic particles'), 'space weather notice tracks the current level')

// Mobile layout.
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check(overflow <= 2, `mobile layout has no horizontal overflow (${overflow}px)`)
await page.screenshot({ path: 'acceptance-mobile.png', fullPage: true })
await page.click('[data-action="mobile-menu"]')
await page.waitForTimeout(300)
check(await page.locator('.training-rail.is-open').count() === 1, 'mobile menu opens the training rail')
await page.click('.training-rail [data-action="glossary"]')
await page.waitForSelector('#glossary-dialog[open]')
const dialogBox = await page.locator('#glossary-dialog').boundingBox()
check(!!dialogBox && dialogBox.width <= 390, 'glossary dialog fits a 390px viewport')
await page.keyboard.press('Escape')
await page.waitForTimeout(200)
check(await page.locator('#glossary-dialog[open]').count() === 0, 'Escape closes the glossary dialog')

// Reset behaviour.
await page.setViewportSize({ width: 1440, height: 1000 })
await page.waitForTimeout(300)
await page.click('[data-action="reset"]')
await page.waitForSelector('#reset-dialog[open]')
await page.click('[data-action="confirm-reset"]')
await page.waitForTimeout(400)
check(await page.locator('.welcome-overlay.is-visible').count() === 1, 'reset returns to the welcome screen')
const cleared = await page.evaluate(() => JSON.parse(localStorage.getItem('astraJuniorProgress') ?? '{}'))
check((cleared.completedLevels ?? []).length === 0 && cleared.currentLevel === 1, 'reset clears saved mission progress back to level 1')

check(errors.length === 0, `no browser console or page errors (${errors.slice(0, 3).join(' | ')})`)

await browser.close()
console.log(`\n${failures.length ? `${failures.length} FAILURES` : 'ALL CHECKS PASSED'}`)
if (failures.length) { console.log(failures.join('\n')); process.exit(1) }
