/**
 * Critical browser interaction journeys for ASTRA Junior.
 * Run after `pnpm build` with `pnpm browser`.
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const port = 4700 + Math.floor(Math.random() * 200)
const base = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const failures = []
const check = (condition, label) => {
  if (condition) console.log(`PASS  ${label}`)
  else { failures.push(label); console.log(`FAIL  ${label}`) }
}

try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { ready = (await fetch(base)).ok; if (ready) break } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  if (!ready) throw new Error('preview server did not start')

  await page.goto(base, { waitUntil: 'networkidle' })
  await page.click('[data-action="start-fresh"]')

  // Mobile navigation must expose its actual expanded state.
  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.locator('[data-action="mobile-menu"]')
  check(await menu.getAttribute('aria-expanded') === 'false', 'mobile menu starts collapsed')
  await menu.click()
  check(await menu.getAttribute('aria-expanded') === 'true', 'mobile menu announces expanded state')
  check(await page.locator('.training-rail.is-open').count() === 1, 'mobile training rail opens')
  await menu.click()
  check(await menu.getAttribute('aria-expanded') === 'false', 'mobile menu announces collapsed state')

  // Clear log requires an explicit confirmation and keeps data on cancel.
  await page.setViewportSize({ width: 1440, height: 1000 })
  const logBefore = await page.locator('.log-list li').count()
  await page.click('[data-action="clear-log"]')
  check(await page.locator('#clear-log-dialog[open]').count() === 1, 'clear log opens a confirmation dialog')
  await page.click('#clear-log-dialog [data-close]')
  check(await page.locator('.log-list li').count() === logBefore, 'cancel keeps the mission log')
  await page.click('[data-action="clear-log"]')
  await page.click('[data-action="confirm-clear-log"]')
  check(await page.locator('.log-list .log-entry').count() === 0 && await page.locator('.log-empty').count() === 1, 'confirm clear removes the mission log')

  // Complete a mission, then exercise retry through the real outcome controls.
  for (let index = 0; index < 6; index += 1) {
    const answer = await page.evaluate(() => {
      const ui = window.__astra.ui
      return ui.activeLevel().systemScenarios[ui.progress.quizIndex].answer
    })
    await page.click(`[data-system="${answer}"]`)
    if (await page.locator('[data-action="next-quiz"]').count()) await page.click('[data-action="next-quiz"]')
  }
  await page.waitForSelector('.outcome-card.outcome-pass')
  await page.click('[data-action="retry"]')
  check(await page.locator('.activity-section').innerText().then(text => text.includes('Match the outpost system')), 'retry returns to the active mission')
  check(await page.locator('.outcome-card').count() === 0, 'retry clears the outcome card')

  // Reset requires confirmation; cancellation keeps the active mission and confirmation persists a fresh save.
  await page.click('[data-action="reset"]')
  await page.click('#reset-dialog [data-close]')
  check(await page.locator('.welcome-overlay.is-visible').count() === 0, 'cancel reset keeps the active mission')
  await page.click('[data-action="reset"]')
  await page.click('[data-action="confirm-reset"]')
  await page.waitForSelector('.welcome-overlay.is-visible')
  const resetSave = await page.evaluate(() => JSON.parse(localStorage.getItem('astraJuniorProgress') ?? '{}'))
  check(resetSave.currentLevel === 1 && resetSave.completedLevels?.length === 0, 'confirmed reset persists fresh progress')

  console.log(`\n${failures.length ? `${failures.length} FAILURES` : 'ALL BROWSER JOURNEYS PASSED'}`)
  if (failures.length) process.exitCode = 1
} finally {
  await browser.close()
  server.kill('SIGTERM')
}
