import { describe, expect, it } from 'vitest'
import { GLOSSARY, GLOSSARY_CATEGORIES, glossaryForLevel, searchGlossary } from '../src/game/glossary'
import { SPACE_WEATHER_DISCLAIMER, SPACE_WEATHER_NOTICES, activityLabel, spaceWeatherForLevel } from '../src/game/space-weather'
import { JUNIOR_SUMMARIES, juniorSummaryForLevel, startersForMode } from '../src/game/junior'
import { buildClassroomReport, classroomReportText } from '../src/game/classroom'
import { getLevel, TOTAL_LEVELS } from '../src/game/mission-data'
import { beginMission, createFreshProgress, createWelcomeProgress, readinessScore } from '../src/game/mission-state'
import { defaultSave, parseSave } from '../src/engine/save'

describe('space glossary', () => {
  it('covers every mission with several relevant terms and unique ids', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(20)
    expect(new Set(GLOSSARY.map(entry => entry.id)).size).toBe(GLOSSARY.length)
    for (let level = 1; level <= TOTAL_LEVELS; level += 1) {
      expect(glossaryForLevel(level).length).toBeGreaterThanOrEqual(2)
    }
    expect(new Set(GLOSSARY.map(entry => entry.category))).toEqual(new Set(GLOSSARY_CATEGORIES))
  })

  it('searches terms, simple definitions, and detail text without case sensitivity', () => {
    expect(searchGlossary('radiat').map(entry => entry.id)).toContain('radiation')
    expect(searchGlossary('INVISIBLE ENERGY').map(entry => entry.id)).toContain('radiation')
    expect(searchGlossary('', 'Space weather').every(entry => entry.category === 'Space weather')).toBe(true)
    expect(searchGlossary('term-that-does-not-exist')).toHaveLength(0)
  })

  it('includes a DONKI entry that explains the training-simulation boundary', () => {
    const donki = GLOSSARY.find(entry => entry.id === 'donki')
    expect(donki?.detail).toContain('not live NASA data')
  })
})

describe('DONKI-style space weather training', () => {
  it('provides exactly one notice for each of the ten levels', () => {
    expect(SPACE_WEATHER_NOTICES).toHaveLength(10)
    for (let level = 1; level <= TOTAL_LEVELS; level += 1) {
      const notice = spaceWeatherForLevel(level)
      expect(notice.level).toBe(level)
      expect(notice.headline.length).toBeGreaterThan(10)
      expect(notice.affectedSystems.length).toBeGreaterThan(0)
      expect(notice.donkiLearning.length).toBeGreaterThan(20)
    }
    expect(spaceWeatherForLevel(99).level).toBe(1)
  })

  it('labels quiet, active, and storm conditions and keeps the simulated-data disclaimer', () => {
    expect(activityLabel('quiet')).toBe('QUIET SUN')
    expect(activityLabel('active')).toBe('ACTIVE SUN')
    expect(activityLabel('storm')).toBe('STORM WATCH')
    expect(SPACE_WEATHER_DISCLAIMER).toContain('not live NASA data')
    expect(spaceWeatherForLevel(8).activity).toBe('quiet')
    expect(spaceWeatherForLevel(8).eventType).toContain('dust')
  })
})

describe('Junior Mode', () => {
  it('summarises all ten missions in plain language', () => {
    expect(Object.keys(JUNIOR_SUMMARIES)).toHaveLength(10)
    for (let level = 1; level <= TOTAL_LEVELS; level += 1) {
      expect(juniorSummaryForLevel(level).length).toBeGreaterThan(30)
    }
    expect(juniorSummaryForLevel(42)).toContain('briefing')
  })

  it('offers sentence starters only when Junior Mode is on', () => {
    expect(startersForMode('decisions', false).length).toBeGreaterThan(0)
    expect(startersForMode('systems', false)).toHaveLength(0)
    expect(startersForMode('systems', true)).toHaveLength(1)
    expect(startersForMode('decisions', true)).toContain('I protected the crew by…')
    expect(startersForMode('kit', true).length).toBeGreaterThan(1)
  })

  it('persists the Junior Mode preference through the settings save', () => {
    expect(defaultSave().juniorMode).toBe(false)
    expect(parseSave(null).juniorMode).toBe(false)
    expect(parseSave(JSON.stringify({ ...defaultSave(), juniorMode: true })).juniorMode).toBe(true)
    expect(parseSave(JSON.stringify({ version: 1, juniorMode: 'yes' })).juniorMode).toBe(false)
  })
})

describe('classroom report', () => {
  it('summarises progress, readiness, and discussion prompts as plain text', () => {
    const progress = createWelcomeProgress(1_000)
    const report = buildClassroomReport(progress, 2_000)
    expect(report.cadet).toBe('CADET')
    expect(report.readiness).toBe(readinessScore(progress.skills))
    expect(report.missionsComplete).toBe(2)
    expect(report.categories).toHaveLength(8)
    expect(report.discussionPrompts).toHaveLength(3)
    expect(report.summaryText).toContain('ASTRA JUNIOR — CLASSROOM REPORT')
    expect(report.summaryText).toContain('Missions complete: 2 of 10')
    expect(report.summaryText).toContain('Strongest skill:')
    expect(report.summaryText).toContain('Training simulation')
    expect(classroomReportText(report)).toBe(report.summaryText)
  })

  it('counts written explanations and reports the next unlocked mission', () => {
    const base = createFreshProgress(1_000)
    const progress = {
      ...base,
      callSign: 'RIVER',
      completedLevels: [1],
      unlockedThrough: 2,
      currentLevel: 2,
      badges: [getLevel(1)!.badge],
      elapsedSeconds: 125,
      decisions: [
        { level: 2, title: 'Test decision', outcome: 'Outcome', risk: 'low' as const, at: 1_100, why: 'I kept the crew safe first.' },
        { level: 2, title: 'Short note', outcome: 'Outcome', risk: 'medium' as const, at: 1_200, why: 'short' },
      ],
      resources: { ...base.resources, oxygen: base.initialResources.oxygen - 5 },
    }
    const report = buildClassroomReport(progress, 2_000)
    expect(report.explanationsWritten).toBe(1)
    expect(report.decisionsRecorded).toBe(2)
    expect(report.missionMinutes).toBe(2)
    expect(report.badges).toContain(getLevel(1)!.badge)
    expect(report.neglectedSystems).toContain('Oxygen')
    expect(report.nextMission).toBe(getLevel(2)!.title)
    expect(report.summaryText).toContain('1 of 10')
  })

  it('starts from a playable mission without inventing decisions', () => {
    const progress = beginMission(createFreshProgress(1_000), 1, 1_000)
    const report = buildClassroomReport(progress, 1_100)
    expect(report.decisionsRecorded).toBe(0)
    expect(report.explanationsWritten).toBe(0)
    expect(report.readiness).toBeGreaterThan(0)
  })
})
