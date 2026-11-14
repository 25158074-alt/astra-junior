/**
 * Junior Mode support: shorter explanations, larger interface targets, and sentence starters
 * that help younger learners write a reasoning statement without facing a blank text box.
 */
export const JUNIOR_SUMMARIES: Record<number, string> = {
  1: 'Read each problem. Pick the outpost system that fixes it. You need 4 right out of 6.',
  2: 'Pack exactly five suit items. Four are safety essentials. The last slot is your choice.',
  3: 'Pack a kit that keeps the crew fed, healthy, and able to repair things. Watch the weight and space limits.',
  4: 'The Sun is gone for two weeks. Choose what to keep running and what to pause.',
  5: 'An astronaut must go outside. Choose how to stay safe from radiation and still finish the job.',
  6: 'Grow food without using up all the water. Every crop choice has a cost.',
  7: 'Mission Control cannot answer quickly. Choose what to do now and explain why.',
  8: 'A dust storm blocks the Sun. Keep the crew alive, even if some science is lost.',
  9: 'The crew is tired. Share the work so the important jobs still get done.',
  10: 'Everything happens at once. Pick the first action that keeps the crew safe, then explain your command.',
}

export const JUNIOR_STARTERS = [
  'I protected the crew by…',
  'The trade-off is…',
  'Later, this could…',
  'I did not choose the other option because…',
]

export const STANDARD_STARTERS = [
  'I prioritized… because…',
  'The risk I accepted is…',
  'The delayed consequence could be…',
]

export function juniorSummaryForLevel(levelId: number): string {
  return JUNIOR_SUMMARIES[levelId] ?? 'Read the briefing, choose carefully, and explain your thinking.'
}

export function startersForMode(mode: 'systems' | 'spacesuit' | 'kit' | 'decisions', junior: boolean): string[] {
  if (!junior) return mode === 'decisions' ? STANDARD_STARTERS : []
  if (mode === 'systems') return ['This system fixes it because…']
  if (mode === 'spacesuit') return ['I kept the crew safe by…', 'The last slot went to… because…']
  if (mode === 'kit') return ['I packed… because…', 'I left out… because…']
  return JUNIOR_STARTERS
}
