import { describe, expect, it } from 'vitest'
import { getLevel, LEVEL_TITLES, TOTAL_LEVELS, type SkillValues } from '../src/game/mission-data'
import {
  answerSystem, beginMission, clearProgress, confirmDecision, confirmKit, confirmLoadout, createFreshProgress,
  kitTotals, loadProgress, parseProgress, PROGRESS_KEY, readinessScore, saveProgress,
  selectDecision, toggleGear, toggleSupply, type StorageLike,
} from '../src/game/mission-state'

describe('ASTRA Junior mission state', () => {
  it('provides a complete ten-level training sequence with distinct objectives and decisions', () => {
    expect(TOTAL_LEVELS).toBe(10)
    expect(LEVEL_TITLES).toHaveLength(10)
    expect(LEVEL_TITLES.map(level => level.title)).toEqual([
      'Welcome to Astronaut Training', 'Choose Your Spacesuit', 'Build Your Mission Kit',
      'Lunar Power Challenge', 'Radiation and EVA Mission', 'Greenhouse and Water Mission',
      'Mars Communication Delay', 'Dust Storm Emergency', 'Crew Health and Teamwork',
      'Mission Commander Challenge',
    ])
    expect(getLevel(1)?.systemScenarios).toHaveLength(6)
    expect(getLevel(1)?.systemScenarios?.map(item => item.answer)).toContain('food')
    expect(getLevel(2)?.gearItems?.length).toBeGreaterThan(5)
    expect(getLevel(3)?.supplies?.length).toBeGreaterThan(5)
    for (let id = 4; id <= 10; id += 1) expect(getLevel(id)?.actions).toHaveLength(3)
  })

  it('scores the five system clues, logs feedback, awards the badge, and unlocks the next implemented level', () => {
    let state = beginMission(createFreshProgress(1_000), 1, 1_000)
    const scenarios = getLevel(1)!.systemScenarios!
    for (const scenario of scenarios) state = answerSystem(state, scenario.answer, 1_200)
    expect(state.phase).toBe('outcome')
    expect(state.quizCorrect).toBe(6)
    expect(state.completedLevels).toEqual([1])
    expect(state.badges).toContain('Systems Spotter')
    expect(state.unlockedThrough).toBe(2)
    expect(state.missionLog.some(entry => entry.title === 'Mission complete')).toBe(true)
  })

  it('allows a retry after a weak systems score without marking the level complete', () => {
    let state = beginMission(createFreshProgress(), 1)
    for (const _scenario of getLevel(1)!.systemScenarios!) state = answerSystem(state, 'not-a-system')
    expect(state.phase).toBe('outcome')
    expect(state.latestOutcome?.passed).toBe(false)
    expect(state.completedLevels).toHaveLength(0)
    expect(state.unlockedThrough).toBe(1)
  })

  it('locks future missions until the previous level is complete, then unlocks the next level', () => {
    const fresh = createFreshProgress()
    expect(beginMission(fresh, 4).currentLevel).toBe(1)
    let state = beginMission(fresh, 3)
    expect(state.currentLevel).toBe(1)
    state = beginMission({ ...fresh, unlockedThrough: 3 }, 3)
    for (const id of getLevel(3)!.essentialSupplies!) state = toggleSupply(state, id)
    state = toggleSupply(state, 'spare-filters')
    state = { ...state, explanationDraft: 'The crew needs an emergency air reserve.' }
    state = confirmKit(state, Date.now())
    expect(state.latestOutcome?.passed).toBe(true)
    expect(state.unlockedThrough).toBe(4)
    expect(beginMission(state, 4).currentLevel).toBe(4)
  })

  it('completes every decision mission through the command capstone', () => {
    let state = { ...createFreshProgress(), unlockedThrough: 10 }
    for (let id = 4; id <= 10; id += 1) {
      state = beginMission(state, id, id * 1_000)
      const action = getLevel(id)!.actions!.find(item => item.best) ?? getLevel(id)!.actions![0]
      state = selectDecision(state, action.id)
      state = { ...state, explanationDraft: `I protect the crew by choosing ${action.title} and accepting the trade-off.` }
      state = confirmDecision(state, id * 1_000 + 500)
      expect(state.phase).toBe('outcome')
      expect(state.latestOutcome?.passed).toBe(true)
    }
    expect(state.completedLevels).toEqual([4, 5, 6, 7, 8, 9, 10])
    expect(state.badges).toContain('Junior Mission Commander')
  })

  it('requires an explanation for an EVA trade-off and records its cause-effect chain', () => {
    const level = getLevel(2)!
    let state = beginMission({ ...createFreshProgress(), unlockedThrough: 2 }, 2, 1_000)
    for (const id of level.essentialGear!) state = toggleGear(state, id)
    state = toggleGear(state, 'sample-container')
    const blocked = confirmLoadout(state, 1_200)
    expect(blocked.phase).toBe('playing')
    expect(blocked.statusMessage).toContain('Explain your decision')
    state = { ...state, explanationDraft: 'Protect the crew before collecting science.' }
    const done = confirmLoadout(state, 1_400)
    expect(done.phase).toBe('outcome')
    expect(done.resources.oxygen).toBe(level.startingResources.oxygen - 4)
    expect(done.resources.power).toBe(level.startingResources.power - 3)
    expect(done.skills.explanation).toBeGreaterThan(state.skills.explanation)
    expect(done.decisions.at(-1)?.why).toBe('Protect the crew before collecting science.')
    expect(done.decisions.at(-1)?.outcome).toContain('oxygen and battery reserves decrease')
    expect(done.missionLog.some(entry => entry.detail.includes('Protect the crew before collecting science.'))).toBe(true)
  })

  it('enforces both cargo limits and models a constrained science-versus-backup choice', () => {
    const level = getLevel(3)!
    let state = beginMission({ ...createFreshProgress(), unlockedThrough: 3 }, 3, 1_000)
    for (const id of level.essentialSupplies!) state = toggleSupply(state, id)
    state = toggleSupply(state, 'spare-filters')
    state = toggleSupply(state, 'science-tools')
    expect(kitTotals(level.supplies, state.kitItems)).toEqual({ massKg: 27, storage: 16 })
    const overLimit = toggleSupply(state, 'batteries')
    expect(overLimit.kitItems).toEqual(state.kitItems)
    expect(overLimit.statusMessage).toContain('does not fit')
    const blocked = confirmKit(state, 1_200)
    expect(blocked.phase).toBe('playing')
    expect(blocked.statusMessage).toContain('Explain your decision')
    state = { ...state, explanationDraft: 'Filters protect life support; science can wait.' }
    const done = confirmKit(state, 1_400)
    expect(done.latestOutcome?.passed).toBe(true)
    expect(done.resources.food).toBe(level.startingResources.food - 2)
    expect(done.resources.water).toBe(level.startingResources.water - 2)
    expect(done.decisions.at(-1)?.risk).toBe('medium')
    expect(done.decisions.at(-1)?.outcome).toContain('Science instruments add discovery potential')
    expect(done.decisions.at(-1)?.why).toBe('Filters protect life support; science can wait.')
    expect(done.unlockedThrough).toBe(4)
  })

  it('stores and sanitizes progress and resets only the ASTRA record', () => {
    let stored: string | null = null
    const storage: StorageLike = {
      getItem(key) { return key === PROGRESS_KEY ? stored : null },
      setItem(key, value) { if (key === PROGRESS_KEY) stored = value },
      removeItem(key) { if (key === PROGRESS_KEY) stored = null },
    }
    const state = { ...createFreshProgress(500), callSign: '<cadet>', explanationDraft: 'Reason saved.' }
    saveProgress(state, storage)
    const loaded = loadProgress(storage, 600)
    expect(loaded.callSign).toBe('<cadet>')
    expect(loaded.explanationDraft).toBe('Reason saved.')
    expect(parseProgress('{bad json}', 700).currentLevel).toBe(3)
    clearProgress(storage)
    expect(stored).toBeNull()
    expect(loadProgress(storage, 700).currentLevel).toBe(3)
  })

  it('includes planning and all seven other skills in the readiness score', () => {
    const all: SkillValues = { safety: 100, resourceManagement: 100, planning: 100, science: 100, emergencyResponse: 100, teamwork: 100, sustainability: 100, explanation: 100 }
    expect(readinessScore(all)).toBe(100)
    expect(readinessScore({ ...all, safety: 0, resourceManagement: 0, planning: 0, science: 0, emergencyResponse: 0, teamwork: 0, sustainability: 0, explanation: 0 })).toBe(0)
    expect(readinessScore({ ...all, safety: 0, resourceManagement: 0, science: 0, emergencyResponse: 0, teamwork: 0, sustainability: 0, explanation: 0 })).toBe(14)
  })
})
