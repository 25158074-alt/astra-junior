import { getLevel, LEVEL_TITLES, RESOURCE_META, SKILL_META, SYSTEM_OPTIONS, TOTAL_LEVELS, type ResourceKey, type ResourceValues, type SkillKey, type SkillValues } from './mission-data'

export const PROGRESS_KEY = 'astraJuniorProgress'
export type MissionPhase = 'welcome' | 'playing' | 'outcome'
export type MissionLogEntry = { id: string; time: number; title: string; detail: string; kind: 'info' | 'success' | 'warning' }
export type DecisionMemory = { level: number; title: string; outcome: string; risk: 'low' | 'medium' | 'high'; at: number; why?: string }
export type MissionOutcome = {
  level: number
  passed: boolean
  title: string
  summary: string
  badge: string
  elapsedSeconds: number
  readiness: number
  strongestSkill: SkillKey
  weakestSkill: SkillKey
  nextTraining: string
}
export type MissionProgress = {
  version: 1
  callSign: string
  currentLevel: number
  unlockedThrough: number
  completedLevels: number[]
  badges: string[]
  resources: ResourceValues
  initialResources: ResourceValues
  skills: SkillValues
  phase: MissionPhase
  quizIndex: number
  quizCorrect: number
  quizAnswers: Array<{ scenarioId: string; correct: boolean }>
  loadout: string[]
  kitItems: string[]
  selectedActionId: string
  explanationDraft: string
  missionLog: MissionLogEntry[]
  decisions: DecisionMemory[]
  startedAt: number
  elapsedSeconds: number
  statusMessage: string
  latestOutcome: MissionOutcome | null
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const defaultSkills = (): SkillValues => ({ safety: 48, resourceManagement: 46, planning: 45, science: 43, emergencyResponse: 44, teamwork: 48, sustainability: 44, explanation: 40 })
const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
const stamp = (now = Date.now()) => now

export function createFreshProgress(now = Date.now()): MissionProgress {
  const level = getLevel(1)!
  return {
    version: 1, callSign: 'CADET', currentLevel: 1, unlockedThrough: 1, completedLevels: [], badges: [],
    resources: { ...level.startingResources }, initialResources: { ...level.startingResources }, skills: defaultSkills(),
    phase: 'welcome', quizIndex: 0, quizCorrect: 0, quizAnswers: [], loadout: [], kitItems: [], selectedActionId: '', explanationDraft: '', missionLog: [], decisions: [],
    startedAt: now, elapsedSeconds: 0, statusMessage: 'Your first training mission is ready.', latestOutcome: null,
  }
}

/** The sample cockpit state matches the brief's 2/10 progress while a new cadet can start a clean run. */
export function createWelcomeProgress(now = Date.now()): MissionProgress {
  const level = getLevel(3)!
  return {
    ...createFreshProgress(now),
    currentLevel: 3, unlockedThrough: 3, completedLevels: [1, 2], badges: ['Systems Spotter', 'Mission Preparer'],
    resources: { ...level.startingResources }, initialResources: { ...level.startingResources },
    statusMessage: 'Continue the sample training record, or begin a new cadet journey.',
  }
}

export function parseProgress(raw: string | null, now = Date.now()): MissionProgress {
  const fallback = createWelcomeProgress(now)
  if (!raw) return fallback
  try {
    const item = JSON.parse(raw) as Partial<MissionProgress>
    if (!item || item.version !== 1 || typeof item.currentLevel !== 'number') return fallback
    const currentLevel = Math.min(TOTAL_LEVELS, Math.max(1, Math.floor(item.currentLevel)))
    const numericResources = (source: unknown, base: ResourceValues): ResourceValues => {
      const record = source && typeof source === 'object' ? source as Partial<ResourceValues> : {}
      return { oxygen: clamp(Number(record.oxygen ?? base.oxygen)), water: clamp(Number(record.water ?? base.water)), power: clamp(Number(record.power ?? base.power)), food: clamp(Number(record.food ?? base.food)), materials: clamp(Number(record.materials ?? base.materials)), health: clamp(Number(record.health ?? base.health)) }
    }
    const base = getLevel(currentLevel)?.startingResources ?? getLevel(1)!.startingResources
    const rawSkills = item.skills && typeof item.skills === 'object' ? item.skills as Partial<SkillValues> : {}
    const skills = Object.fromEntries((Object.keys(SKILL_META) as SkillKey[]).map(key => [key, clamp(Number(rawSkills[key] ?? 40))])) as SkillValues
    const validStrings = (v: unknown, limit = 40): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, limit) : []
    const completedLevels = [...new Set((Array.isArray(item.completedLevels) ? item.completedLevels : []).filter((v): v is number => Number.isInteger(v) && v >= 1 && v <= TOTAL_LEVELS))].sort((a, b) => a - b)
    const unlockedThrough = Math.max(1, Math.min(TOTAL_LEVELS, Number.isInteger(item.unlockedThrough) ? item.unlockedThrough! : Math.max(...completedLevels, 1)))
    const phase: MissionPhase = item.phase === 'playing' || item.phase === 'outcome' ? item.phase : 'welcome'
    const log = Array.isArray(item.missionLog) ? item.missionLog.filter((v): v is MissionLogEntry => !!v && typeof v === 'object' && typeof v.title === 'string' && typeof v.detail === 'string').slice(-100) : []
    const decisions = Array.isArray(item.decisions) ? item.decisions.filter((v): v is DecisionMemory => !!v && typeof v === 'object' && typeof v.title === 'string').slice(-100) : []
    return {
      version: 1, callSign: typeof item.callSign === 'string' ? item.callSign.slice(0, 16) : 'CADET', currentLevel,
      unlockedThrough, completedLevels, badges: validStrings(item.badges), resources: numericResources(item.resources, base),
      initialResources: numericResources(item.initialResources, base), skills, phase,
      quizIndex: Math.min(5, Math.max(0, Number.isInteger(item.quizIndex) ? item.quizIndex! : 0)),
      quizCorrect: Math.min(5, Math.max(0, Number.isInteger(item.quizCorrect) ? item.quizCorrect! : 0)),
      quizAnswers: Array.isArray(item.quizAnswers) ? item.quizAnswers.filter(v => v && typeof v.scenarioId === 'string').slice(0, 5) : [],
      loadout: validStrings(item.loadout, 12), kitItems: validStrings(item.kitItems, 16), selectedActionId: typeof item.selectedActionId === 'string' ? item.selectedActionId.slice(0, 64) : '', explanationDraft: typeof item.explanationDraft === 'string' ? item.explanationDraft.slice(0, 160) : '', missionLog: log, decisions,
      startedAt: Number.isFinite(item.startedAt) ? item.startedAt! : now,
      elapsedSeconds: clamp(Number(item.elapsedSeconds ?? 0), 0, 1_000_000),
      statusMessage: typeof item.statusMessage === 'string' ? item.statusMessage.slice(0, 240) : '',
      latestOutcome: item.latestOutcome && typeof item.latestOutcome === 'object' ? item.latestOutcome : null,
    }
  } catch {
    return fallback
  }
}

export function loadProgress(storage: StorageLike | undefined = globalThis.localStorage, now = Date.now()): MissionProgress {
  try { return parseProgress(storage?.getItem(PROGRESS_KEY) ?? null, now) } catch { return createWelcomeProgress(now) }
}
export function saveProgress(progress: MissionProgress, storage: StorageLike | undefined = globalThis.localStorage): void {
  try { storage?.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* Keep play available when storage is blocked or full. */ }
}
export function clearProgress(storage: StorageLike | undefined = globalThis.localStorage): void {
  try { storage?.removeItem(PROGRESS_KEY) } catch { /* Reset still works in memory. */ }
}

function addLog(state: MissionProgress, title: string, detail: string, kind: MissionLogEntry['kind'], now = Date.now()): MissionLogEntry[] {
  return [...state.missionLog, { id: `${now}-${state.missionLog.length}`, time: stamp(now), title, detail, kind }].slice(-100)
}
function levelComplete(state: MissionProgress, passed: boolean, summary: string, now = Date.now()): MissionProgress {
  const level = getLevel(state.currentLevel)!
  const completedLevels = passed ? [...new Set([...state.completedLevels, level.id])].sort((a, b) => a - b) : state.completedLevels
  const badges = passed ? [...new Set([...state.badges, level.badge])] : state.badges
  const nextAvailable = getLevel(level.id + 1) ? level.id + 1 : state.unlockedThrough
  const unlockedThrough = passed ? Math.max(state.unlockedThrough, Math.min(TOTAL_LEVELS, nextAvailable)) : state.unlockedThrough
  const elapsedSeconds = Math.max(0, state.elapsedSeconds + Math.floor((now - state.startedAt) / 1000))
  
  const skills = { ...state.skills }
  if (passed) {
    skills.planning = clamp(skills.planning + 4)
    skills.explanation = clamp(skills.explanation + 3)
  }

  const strongest = strongestSkill(skills)
  const weakest = weakestSkill(skills)
  const readiness = readinessScore(skills)
  const nextTraining = passed ? LEVEL_TITLES.find(l => l.id === Math.min(TOTAL_LEVELS, level.id + 1))?.title ?? 'Mission Commander Challenge' : 'Retry this mission and try a new plan.'
  
  const result: MissionOutcome = { 
    level: level.id, 
    passed, 
    title: passed ? `${level.badge} earned` : 'Mission practice complete', 
    summary, 
    badge: passed ? level.badge : '', 
    elapsedSeconds, 
    readiness, 
    strongestSkill: strongest, 
    weakestSkill: weakest, 
    nextTraining 
  }

  return { ...state, skills, completedLevels, badges, unlockedThrough, phase: 'outcome', elapsedSeconds, latestOutcome: result, statusMessage: summary, missionLog: addLog(state, passed ? 'Mission complete' : 'Recovery opportunity', summary, passed ? 'success' : 'warning', now) }
}

export function beginMission(state: MissionProgress, levelId: number, now = Date.now()): MissionProgress {
  const level = getLevel(levelId)
  if (!level || levelId > state.unlockedThrough) return { ...state, statusMessage: 'That mission is still locked. Complete the earlier training first.' }
  
  // Apply delayed consequences from the PREVIOUS decision if any
  const resources = { ...level.startingResources }
  let log = state.missionLog
  
  const lastDecision = state.decisions.at(-1)
  if (lastDecision) {
    const prevLevel = getLevel(lastDecision.level)
    const prevAction = prevLevel?.actions?.find(a => lastDecision.outcome.startsWith(a.outcome))
    if (prevAction?.delayedDelta) {
      const deltas = prevAction.delayedDelta
      let detail = "Applied consequences from your earlier command: "
      const parts: string[] = []
      for (const key of Object.keys(deltas) as ResourceKey[]) {
        const change = deltas[key] ?? 0
        if (change === 0) continue
        resources[key] = clamp(resources[key] + change)
        parts.push(`${getResourceMeta(key).label} ${change > 0 ? "+" : ""}${change}%`)
      }
      if (parts.length > 0) {
        detail += parts.join(", ")
      log = [...log, { id: `delayed-${now}`, time: stamp(now), title: 'Delayed Consequence', detail, kind: 'info' as const }].slice(-100)
      }
    }
  }

  return {
    ...state, currentLevel: levelId, resources, initialResources: { ...resources },
    phase: 'playing', quizIndex: 0, quizCorrect: 0, quizAnswers: [], loadout: [], kitItems: [], selectedActionId: '', explanationDraft: '', startedAt: now,
    elapsedSeconds: 0, latestOutcome: null, statusMessage: level.objective,
    missionLog: addLog({ ...state, missionLog: log }, `Level ${String(levelId).padStart(2, '0')} briefing`, level.briefing, 'info', now),
  }
}

export function answerSystem(state: MissionProgress, selected: string, now = Date.now()): MissionProgress {
  const level = getLevel(state.currentLevel)
  const scenario = level?.systemScenarios?.[state.quizIndex]
  if (!level || level.mode !== 'systems' || state.phase !== 'playing' || !scenario) return state
  const correct = selected === scenario.answer
  const quizCorrect = state.quizCorrect + (correct ? 1 : 0)
  const quizIndex = state.quizIndex + 1
  const skills = { ...state.skills, safety: clamp(state.skills.safety + (correct ? 2 : 0)), resourceManagement: clamp(state.skills.resourceManagement + (correct ? 1 : 0)) }
  const message = correct ? `Correct. ${scenario.explanation}` : `Not quite. ${scenario.explanation}`
  const next: MissionProgress = {
    ...state, quizIndex, quizCorrect, skills,
    quizAnswers: [...state.quizAnswers, { scenarioId: scenario.id, correct }],
    statusMessage: message,
    missionLog: addLog(state, correct ? 'System matched' : 'System clue reviewed', `${scenario.prompt} ${message}`, correct ? 'success' : 'warning', now),
  }
  if (quizIndex < (level.systemScenarios?.length ?? 0)) return next
  const total = level.systemScenarios?.length ?? 0
  const passed = quizCorrect >= 4
  return levelComplete(next, passed, passed ? `You matched ${quizCorrect} of ${total} system problems. Outpost systems spotted.` : `You matched ${quizCorrect} of ${total}. Review the clues, then retry the system check.`, now)
}

export function selectDecision(state: MissionProgress, actionId: string): MissionProgress {
  const level = getLevel(state.currentLevel)
  const action = level?.actions?.find(item => item.id === actionId)
  if (!level || level.mode !== 'decisions' || state.phase !== 'playing' || !action) return state
  return { ...state, selectedActionId: action.id, statusMessage: `${action.title} selected. Review the benefit, cost, and delayed risk, then explain your decision.` }
}

export function confirmDecision(state: MissionProgress, now = Date.now(), explanation = state.explanationDraft): MissionProgress {
  const level = getLevel(state.currentLevel)
  const action = level?.actions?.find(item => item.id === state.selectedActionId)
  if (!level || level.mode !== 'decisions' || state.phase !== 'playing' || !action) return { ...state, statusMessage: 'Choose one priority before confirming your command.' }
  if (explanation.trim().length < 8) return { ...state, statusMessage: 'Explain your decision in at least 8 characters. Name the priority and the trade-off you accepted.' }
  const why = explanation.trim().slice(0, 160)
  const resources = { ...state.resources }
  for (const key of Object.keys(action.resourceDelta) as ResourceKey[]) resources[key] = clamp(resources[key] + (action.resourceDelta[key] ?? 0))
  const skills = { ...state.skills }
  for (const key of Object.keys(action.skillDelta) as SkillKey[]) skills[key] = clamp(skills[key] + (action.skillDelta[key] ?? 0))
  const decision: DecisionMemory = { level: level.id, title: action.title, outcome: `${action.outcome} ${action.benefit} Cost: ${action.cost} Delayed risk: ${action.delayedRisk} Cause → effect → later: ${action.causeChain.join(' → ')} Player explanation: “${why}”`, risk: action.risk, at: now, why }
  const safe = Math.min(resources.oxygen, resources.water, resources.power, resources.health) >= 18
  const passed = safe || action.risk !== 'high'
  const next = { ...state, resources, skills, selectedActionId: '', explanationDraft: '', decisions: [...state.decisions, decision], missionLog: addLog(state, action.title, decision.outcome, passed ? 'success' : 'warning', now), statusMessage: decision.outcome }
  return levelComplete(next, passed, passed ? `${action.outcome} Your explanation showed how a priority creates both an immediate effect and a later consequence.` : `The choice created a recovery opportunity. Review the delayed risk, then retry with a safer priority.`, now)
}

export function toggleGear(state: MissionProgress, gearId: string): MissionProgress {
  const level = getLevel(state.currentLevel)
  const item = level?.gearItems?.find(i => i.id === gearId)
  if (!level || level.mode !== 'spacesuit' || state.phase !== 'playing' || !item) return state
  const has = state.loadout.includes(gearId)
  if (!has && state.loadout.length >= (level.equipmentSlots ?? 5)) return { ...state, statusMessage: `Your suit has ${level.equipmentSlots ?? 5} slots. Remove one item before adding another.` }
  return { ...state, loadout: has ? state.loadout.filter(id => id !== gearId) : [...state.loadout, gearId], statusMessage: has ? `${item.name} removed from your loadout.` : `${item.name} added to your loadout.` }
}

export function confirmLoadout(state: MissionProgress, now = Date.now(), explanation = state.explanationDraft): MissionProgress {
  const level = getLevel(state.currentLevel)
  if (!level || level.mode !== 'spacesuit' || state.phase !== 'playing') return state
  const required = level.essentialGear ?? []
  const missing = required.filter(id => !state.loadout.includes(id))
  const total = level.equipmentSlots ?? 5
  if (state.loadout.length !== total) return { ...state, statusMessage: `Choose exactly ${total} items before launching the EVA.` }
  if (missing.length) {
    const names = missing.map(id => level.gearItems?.find(item => item.id === id)?.name ?? id).join(', ')
    return { ...state, statusMessage: `Safety check: add the essential equipment still missing — ${names}. You can change your loadout.` }
  }
  if (explanation.trim().length < 8) return { ...state, statusMessage: 'Explain your decision in at least 8 characters. What did you protect, and what trade-off did you accept?' }
  const why = explanation.trim().slice(0, 160)
  const optional = state.loadout.filter(id => !required.includes(id))
  const extraId = optional[0] ?? ''
  const extraEffects: Record<string, { title: string; science: number; oxygen: number; power: number; materials: number; emergencyResponse: number; safety: number; risk: 'low' | 'medium'; cause: string }> = {
    'sample-container': { title: 'Prioritized a surface science sample', science: 8, oxygen: -4, power: -3, materials: 0, emergencyResponse: 0, safety: 0, risk: 'medium', cause: 'The sample adds science value but makes the return pack heavier.' },
    'tool-kit': { title: 'Brought repair tools for the EVA', science: 5, oxygen: -5, power: -3, materials: 4, emergencyResponse: 6, safety: 0, risk: 'medium', cause: 'Tools add a small repair option but slow the return and use more air.' },
    'emergency-battery': { title: 'Carried backup power for the EVA', science: 2, oxygen: -4, power: 2, materials: 0, emergencyResponse: 2, safety: 2, risk: 'low', cause: 'The charged reserve keeps net power available but leaves no slot for a sample or repair kit.' },
  }
  const effect = extraEffects[extraId] ?? extraEffects['emergency-battery']
  const extra = level.gearItems?.find(item => item.id === extraId)
  const changedBy = (label: string, value: number): string => `${label} ${value < 0 ? '−' : '+'}${Math.abs(value)}%`
  const reserveNote = effect.oxygen < 0 && effect.power < 0
    ? ` oxygen and battery reserves decrease (${Math.abs(effect.oxygen)}% air, ${Math.abs(effect.power)}% battery).`
    : ''
  const chain = `Four safety essentials → safer surface time → ${extra?.name ?? 'extra equipment'}: ${effect.cause}${reserveNote} ${changedBy('Oxygen', effect.oxygen)}, ${changedBy('power', effect.power)}${effect.materials ? `, Materials +${effect.materials}%` : ''}.`
  const skills = { ...state.skills, safety: clamp(state.skills.safety + 7 + effect.safety), planning: clamp(state.skills.planning + 6), science: clamp(state.skills.science + effect.science), emergencyResponse: clamp(state.skills.emergencyResponse + effect.emergencyResponse), explanation: clamp(state.skills.explanation + 8) }
  const next = { ...state, skills, resources: { ...state.resources, oxygen: clamp(state.resources.oxygen + effect.oxygen), power: clamp(state.resources.power + effect.power), materials: clamp(state.resources.materials + effect.materials) }, explanationDraft: '', statusMessage: `Your reason: “${why}” ${chain}` }
  const decision = { level: 2, title: effect.title, outcome: `${extra?.benefit ?? 'Backup power stays available.'} Trade-off: ${extra?.tradeoff ?? 'It takes the final equipment slot.'} ${chain} Player explanation: “${why}”`, risk: effect.risk, at: now, why }
  const logged = { ...next, decisions: [...state.decisions, decision], missionLog: addLog(next, 'Suit check complete', decision.outcome, 'success', now) }
  return levelComplete(logged, true, `All ${total} slots are filled with the four essential protections. The EVA can return safely.`, now)
}

export function toggleSupply(state: MissionProgress, supplyId: string): MissionProgress {
  const level = getLevel(state.currentLevel)
  const item = level?.supplies?.find(i => i.id === supplyId)
  if (!level || level.mode !== 'kit' || state.phase !== 'playing' || !item) return state
  const has = state.kitItems.includes(supplyId)
  const kitItems = has ? state.kitItems.filter(id => id !== supplyId) : [...state.kitItems, supplyId]
  const totals = kitTotals(level.supplies ?? [], kitItems)
  if (!has && (totals.massKg > (level.massLimitKg ?? Infinity) || totals.storage > (level.storageLimit ?? Infinity))) return { ...state, statusMessage: `${item.name} does not fit. The kit is limited to ${level.massLimitKg} kg and ${level.storageLimit} storage units.` }
  return { ...state, kitItems, statusMessage: has ? `${item.name} removed from the cargo kit.` : `${item.name} packed.` }
}

export function kitTotals(supplies: NonNullable<ReturnType<typeof getLevel>>['supplies'], ids: string[]): { massKg: number; storage: number } {
  const chosen = (supplies ?? []).filter(item => ids.includes(item.id))
  return { massKg: chosen.reduce((sum, item) => sum + item.weightKg, 0), storage: chosen.reduce((sum, item) => sum + item.storageUnits, 0) }
}

export function confirmKit(state: MissionProgress, now = Date.now(), explanation = state.explanationDraft): MissionProgress {
  const level = getLevel(state.currentLevel)
  if (!level || level.mode !== 'kit' || state.phase !== 'playing') return state
  const items = level.supplies ?? []
  const totals = kitTotals(items, state.kitItems)
  const required = level.essentialSupplies ?? []
  const missing = required.filter(id => !state.kitItems.includes(id))
  const backup = state.kitItems.includes('batteries') || state.kitItems.includes('spare-filters')
  if (totals.massKg > (level.massLimitKg ?? Infinity) || totals.storage > (level.storageLimit ?? Infinity)) return { ...state, statusMessage: 'This kit is over capacity. Remove supplies until both limits are safe.' }
  if (missing.length || !backup) return { ...state, statusMessage: `${missing.length ? 'Pack the food, water, medical and repair essentials. ' : ''}${!backup ? 'Add batteries or spare air filters as an emergency reserve.' : ''}`.trim() }
  if (explanation.trim().length < 8) return { ...state, statusMessage: 'Explain your decision in at least 8 characters. Which supplies mattered most, and what could not fit?' }
  const why = explanation.trim().slice(0, 160)
  const skills = { ...state.skills, resourceManagement: clamp(state.skills.resourceManagement + 8), planning: clamp(state.skills.planning + 8), sustainability: clamp(state.skills.sustainability + 4), explanation: clamp(state.skills.explanation + 8) }
  const science = state.kitItems.includes('science-tools') ? 'Science instruments add discovery potential but use scarce cargo capacity.' : 'The kit keeps a cargo reserve available for later science.'
  const backupName = state.kitItems.includes('batteries') ? 'Portable batteries' : 'Spare air filters'
  const chain = `Food, water, and medical supplies → crew readiness. Repair tools → outpost recovery. ${backupName} → backup for a system failure. ${science}`
  const decision = { level: 3, title: 'Packed a balanced mission kit', outcome: `The kit uses ${totals.massKg} of ${level.massLimitKg} kg and ${totals.storage} of ${level.storageLimit} storage units. ${chain} Player explanation: “${why}”`, risk: state.kitItems.includes('science-tools') ? 'medium' as const : 'low' as const, at: now, why }
  const next = { ...state, skills, explanationDraft: '', resources: { ...state.resources, food: clamp(state.resources.food - 2), water: clamp(state.resources.water - 2), materials: clamp(state.resources.materials - 1) }, decisions: [...state.decisions, decision], statusMessage: `${decision.outcome}`, missionLog: addLog(state, 'Cargo kit secured', decision.outcome, 'success', now) }
  return levelComplete(next, true, 'Your kit covers crew needs, repair, and an emergency backup without exceeding either limit.', now)
}

export function retryMission(state: MissionProgress, now = Date.now()): MissionProgress { return beginMission(state, state.currentLevel, now) }
export function resetToFresh(now = Date.now()): MissionProgress { return createFreshProgress(now) }
export function readinessScore(skills: SkillValues): number {
  const weighted: Array<[SkillKey, number]> = [['safety', .20], ['resourceManagement', .18], ['planning', .14], ['science', .10], ['emergencyResponse', .13], ['teamwork', .11], ['sustainability', .08], ['explanation', .06]]
  return Math.round(weighted.reduce((sum, [key, weight]) => sum + clamp(skills[key]) * weight, 0))
}
export function resourceStatus(value: number): { label: 'Stable' | 'Warning' | 'Critical'; tone: string } {
  if (value < 25) return { label: 'Critical', tone: 'critical' }
  if (value < 55) return { label: 'Warning', tone: 'warning' }
  return { label: 'Stable', tone: 'stable' }
}
export function strongestSkill(skills: SkillValues): SkillKey { return (Object.keys(SKILL_META) as SkillKey[]).reduce((a, b) => skills[a] >= skills[b] ? a : b) }
export function weakestSkill(skills: SkillValues): SkillKey { return (Object.keys(SKILL_META) as SkillKey[]).reduce((a, b) => skills[a] <= skills[b] ? a : b) }
export function logRelativeTime(timestamp: number, base = Date.now()): string { const seconds = Math.max(0, Math.floor((base - timestamp) / 1000)); return seconds < 60 ? `${String(seconds).padStart(2, '0')}s` : `${Math.floor(seconds / 60)}m` }
export const safeResourceValue = (resources: ResourceValues, key: ResourceKey): number => clamp(resources[key])
export const systemChoices = SYSTEM_OPTIONS
export const getResourceMeta = (key: ResourceKey) => RESOURCE_META[key]
