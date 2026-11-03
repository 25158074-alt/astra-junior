import { LEVEL_TITLES, RESOURCE_META, SKILL_META, TOTAL_LEVELS, type ResourceKey, type SkillKey } from './mission-data'
import { readinessScore, type MissionProgress } from './mission-state'

export type ClassroomCategory = { key: SkillKey; label: string; value: number }

export type ClassroomReport = {
  cadet: string
  generatedAt: number
  readiness: number
  missionsComplete: number
  totalMissions: number
  badges: string[]
  categories: ClassroomCategory[]
  strongest: ClassroomCategory
  practice: ClassroomCategory
  decisionsRecorded: number
  explanationsWritten: number
  missionMinutes: number
  protectedSystems: string[]
  neglectedSystems: string[]
  nextMission: string
  discussionPrompts: string[]
  summaryText: string
}

const SKILL_ORDER: SkillKey[] = ['safety', 'resourceManagement', 'planning', 'science', 'emergencyResponse', 'teamwork', 'sustainability', 'explanation']
const RESOURCE_ORDER: ResourceKey[] = ['oxygen', 'water', 'power', 'food', 'health', 'materials']

const PROMPTS: Record<SkillKey, string> = {
  safety: 'Which decision best protected the crew, and what did it cost?',
  resourceManagement: 'Where did the crew spend a resource early, and what would a reserve have changed?',
  planning: 'Which choice looked helpful now but created a problem later?',
  science: 'When was science worth the risk, and when was it not?',
  emergencyResponse: 'What did the crew do first in an emergency, and why was order important?',
  teamwork: 'How did the crew share work when someone was tired or busy?',
  sustainability: 'Which system kept resources in use the longest?',
  explanation: 'Can you explain a decision in one sentence using benefit, cost, and later risk?',
}

/** Build a teacher-facing summary from saved mission data. Pure so it can be unit tested. */
export function buildClassroomReport(progress: MissionProgress, now = Date.now()): ClassroomReport {
  const categories = SKILL_ORDER.map(key => ({ key, label: SKILL_META[key].label, value: Math.round(progress.skills[key]) }))
  const strongest = categories.reduce((a, b) => (b.value > a.value ? b : a))
  const practice = categories.reduce((a, b) => (b.value < a.value ? b : a))
  const protectedSystems = RESOURCE_ORDER.filter(key => progress.resources[key] >= progress.initialResources[key]).map(key => RESOURCE_META[key].label)
  const neglectedSystems = RESOURCE_ORDER.filter(key => progress.resources[key] < progress.initialResources[key]).map(key => RESOURCE_META[key].label)
  const explanationsWritten = progress.decisions.filter(decision => (decision.why ?? '').trim().length >= 8).length
  const nextLevel = LEVEL_TITLES.find(level => level.id === Math.min(TOTAL_LEVELS, progress.currentLevel + (progress.completedLevels.includes(progress.currentLevel) ? 1 : 0)))
  const report: ClassroomReport = {
    cadet: progress.callSign || 'CADET',
    generatedAt: now,
    readiness: readinessScore(progress.skills),
    missionsComplete: progress.completedLevels.length,
    totalMissions: TOTAL_LEVELS,
    badges: [...progress.badges],
    categories,
    strongest,
    practice,
    decisionsRecorded: progress.decisions.length,
    explanationsWritten,
    missionMinutes: Math.round(progress.elapsedSeconds / 60),
    protectedSystems,
    neglectedSystems,
    nextMission: nextLevel?.title ?? 'Mission Commander Challenge',
    discussionPrompts: [
      PROMPTS[practice.key],
      `How did the crew protect ${protectedSystems[0] ?? 'life support'} while ${neglectedSystems[0] ?? 'science'} received less attention?`,
      'What would you decide differently on a second attempt, and why?',
    ],
    summaryText: '',
  }
  report.summaryText = classroomReportText(report)
  return report
}

/** Plain-text version used by the "Copy summary" control and by teachers pasting into a report. */
export function classroomReportText(report: ClassroomReport): string {
  const lines = [
    'ASTRA JUNIOR — CLASSROOM REPORT',
    `Cadet: ${report.cadet}`,
    `Missions complete: ${report.missionsComplete} of ${report.totalMissions}`,
    `Mission readiness: ${report.readiness}/100`,
    `Badges: ${report.badges.length ? report.badges.join(', ') : 'None yet'}`,
    `Decisions recorded: ${report.decisionsRecorded} (${report.explanationsWritten} with a written explanation)`,
    `Mission time: ${report.missionMinutes} min`,
    '',
    'Readiness profile:',
    ...report.categories.map(category => `  ${category.label}: ${category.value}%`),
    '',
    `Strongest skill: ${report.strongest.label} (${report.strongest.value}%)`,
    `Skill to practise: ${report.practice.label} (${report.practice.value}%)`,
    `Systems protected: ${report.protectedSystems.join(', ') || 'None recorded yet'}`,
    `Systems with reduced reserves: ${report.neglectedSystems.join(', ') || 'None'}`,
    `Next mission: ${report.nextMission}`,
    '',
    'Discussion prompts:',
    ...report.discussionPrompts.map((prompt, index) => `  ${index + 1}. ${prompt}`),
    '',
    'Training simulation — not a real spacecraft control system and not a NASA product.',
  ]
  return lines.join('\n')
}
