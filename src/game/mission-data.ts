export type ResourceKey = 'oxygen' | 'water' | 'power' | 'food' | 'materials' | 'health'
export type ResourceValues = Record<ResourceKey, number>
export type SkillKey = 'safety' | 'resourceManagement' | 'planning' | 'science' | 'emergencyResponse' | 'teamwork' | 'sustainability' | 'explanation'
export type SkillValues = Record<SkillKey, number>
export type MissionMode = 'systems' | 'spacesuit' | 'kit' | 'decisions'

export type SystemScenario = {
  id: string
  prompt: string
  answer: 'oxygen' | 'power' | 'water' | 'food' | 'temperature' | 'communication'
  explanation: string
  icon: string
}

export type GearItem = {
  id: string
  name: string
  description: string
  icon: string
  essential: boolean
  benefit: string
  tradeoff: string
}

export type SupplyItem = {
  id: string
  name: string
  description: string
  category: string
  weightKg: number
  storageUnits: number
  essential: boolean
  icon: string
}

export type DecisionAction = {
  id: string
  title: string
  description: string
  benefit: string
  cost: string
  delayedRisk: string
  outcome: string
  resourceDelta: Partial<ResourceValues>
  delayedDelta: Partial<ResourceValues>
  skillDelta: Partial<SkillValues>
  causeChain: string[]
  risk: 'low' | 'medium' | 'high'
  best?: boolean
}

export type MissionLevel = {
  id: number
  title: string
  shortTitle: string
  location: string
  world: 'training' | 'moon' | 'mars'
  mode: MissionMode
  objective: string
  briefing: string
  missionControl: string
  risk: string
  learningObjective: string
  badge: string
  badgeMark: string
  event: string
  startingResources: ResourceValues
  systemScenarios?: SystemScenario[]
  gearItems?: GearItem[]
  equipmentSlots?: number
  essentialGear?: string[]
  supplies?: SupplyItem[]
  massLimitKg?: number
  storageLimit?: number
  essentialSupplies?: string[]
  actions?: DecisionAction[]
  visualContext: string
}

export type LevelSummary = { id: number; title: string; shortTitle: string; badge: string }

export const TOTAL_LEVELS = 10
export const LEVEL_TITLES: LevelSummary[] = [
  { id: 1, title: 'Welcome to Astronaut Training', shortTitle: 'Systems Spotter', badge: 'Systems Spotter' },
  { id: 2, title: 'Choose Your Spacesuit', shortTitle: 'Suit Check', badge: 'Mission Preparer' },
  { id: 3, title: 'Build Your Mission Kit', shortTitle: 'Mission Kit', badge: 'Resource Planner' },
  { id: 4, title: 'Lunar Power Challenge', shortTitle: 'Lunar Power', badge: 'Power Guardian' },
  { id: 5, title: 'Radiation and EVA Mission', shortTitle: 'Radiation EVA', badge: 'Safety Specialist' },
  { id: 6, title: 'Greenhouse and Water Mission', shortTitle: 'Greenhouse', badge: 'Life-Support Farmer' },
  { id: 7, title: 'Mars Communication Delay', shortTitle: 'Signal Delay', badge: 'Independent Decision-Maker' },
  { id: 8, title: 'Dust Storm Emergency', shortTitle: 'Dust Storm', badge: 'Storm Commander' },
  { id: 9, title: 'Crew Health and Teamwork', shortTitle: 'Crew Health', badge: 'Crew Leader' },
  { id: 10, title: 'Mission Commander Challenge', shortTitle: 'Command', badge: 'Junior Mission Commander' },
]

export const RESOURCE_META: Record<ResourceKey, { label: string; icon: string; unit: string; description: string; color: string }> = {
  oxygen: { label: 'Oxygen', icon: '◌', unit: '%', description: 'Breathable air for the crew', color: 'cyan' },
  water: { label: 'Water', icon: '◈', unit: '%', description: 'Drinking, hygiene, and plant supply', color: 'blue' },
  power: { label: 'Power', icon: 'ϟ', unit: '%', description: 'Stored electricity for mission systems', color: 'amber' },
  food: { label: 'Food', icon: '✳', unit: '%', description: 'Food available for the crew', color: 'green' },
  materials: { label: 'Materials', icon: '⬡', unit: '%', description: 'Repair and construction supplies', color: 'violet' },
  health: { label: 'Crew Health', icon: '♡', unit: '%', description: 'Physical and mental crew condition', color: 'rose' },
}

export const SKILL_META: Record<SkillKey, { label: string; short: string; icon: string }> = {
  safety: { label: 'Safety awareness', short: 'Safety', icon: '◈' },
  resourceManagement: { label: 'Resource management', short: 'Resources', icon: '▤' },
  planning: { label: 'Planning', short: 'Planning', icon: '⌖' },
  science: { label: 'Science', short: 'Science', icon: '⌬' },
  emergencyResponse: { label: 'Emergency response', short: 'Response', icon: 'ϟ' },
  teamwork: { label: 'Teamwork', short: 'Teamwork', icon: '◎' },
  sustainability: { label: 'Sustainability', short: 'Sustainability', icon: '⟲' },
  explanation: { label: 'Decision explanation', short: 'Reasoning', icon: '↗' },
}

export const SYSTEM_OPTIONS: Array<{ id: SystemScenario['answer']; label: string; icon: string }> = [
  { id: 'oxygen', label: 'Oxygen system', icon: '◌' },
  { id: 'water', label: 'Water recycler', icon: '◈' },
  { id: 'food', label: 'Food stores', icon: '✳' },
  { id: 'power', label: 'Power system', icon: 'ϟ' },
  { id: 'temperature', label: 'Thermal control', icon: '⌁' },
  { id: 'communication', label: 'Communications', icon: '⌁' },
]

const baseResources = (overrides: Partial<ResourceValues> = {}): ResourceValues => ({
  oxygen: 92, water: 84, power: 76, food: 78, materials: 62, health: 91, ...overrides,
})

export const LEVELS: MissionLevel[] = [
  {
    id: 1,
    title: 'Welcome to Astronaut Training',
    shortTitle: 'Systems Spotter',
    location: 'TRAINING CENTER · HABITAT A',
    world: 'training',
    mode: 'systems',
    objective: 'Match six outpost problems to the system that needs help.',
    briefing: 'Every habitat depends on connected systems. Read each clue, choose the system that can help, and learn how the pieces work together.',
    missionControl: 'Start with the clues you can observe. One careful match can protect the whole crew.',
    risk: 'A system problem can spread if it is missed.',
    learningObjective: 'Recognize oxygen, water, food, power, temperature, and communication systems.',
    badge: 'Systems Spotter',
    badgeMark: '◎',
    event: 'A training systems check is ready.',
    startingResources: baseResources(),
    visualContext: 'A calm training habitat with all systems online.',
    systemScenarios: [
      { id: 'air-filter', prompt: 'The air filter is clogged. The crew cannot get enough breathable air.', answer: 'oxygen', explanation: 'The life-support oxygen system filters and refreshes the air the crew breathes.', icon: '◌' },
      { id: 'empty-battery', prompt: 'The backup battery is empty, so equipment may shut down.', answer: 'power', explanation: 'The power system stores electricity so important equipment can keep running.', icon: 'ϟ' },
      { id: 'water-leak', prompt: 'A pipe is leaking and the clean-water tank is dropping.', answer: 'water', explanation: 'The water recycler and pipes supply drinking water, hygiene, and plants.', icon: '◈' },
      { id: 'low-food', prompt: 'The greenhouse harvest is delayed and the crew meal stores are running low.', answer: 'food', explanation: 'Food stores and greenhouse systems help keep the crew supplied with meals.', icon: '✳' },
      { id: 'failed-heater', prompt: 'The habitat heater stopped and the room is getting too cold.', answer: 'temperature', explanation: 'Thermal control keeps the habitat at a safe temperature for people and equipment.', icon: '⌁' },
      { id: 'comms-outage', prompt: 'The radio is silent and Mission Control cannot hear the crew.', answer: 'communication', explanation: 'Communication links the outpost to the crew and Mission Control.', icon: '⌁' },
    ],
  },
  {
    id: 2,
    title: 'Choose Your Spacesuit',
    shortTitle: 'Suit Check',
    location: 'MOON · POLAR RIDGE',
    world: 'moon',
    mode: 'spacesuit',
    objective: 'Pack five suit items for a short rock-sample trip and return safely.',
    briefing: 'You will inspect a rock near the habitat. Your pack has five equipment slots, so choose carefully. Safety gear comes first; extra tools can add science but make the pack heavier.',
    missionControl: 'A complete suit protects oxygen, warmth, radiation safety, and your link to the crew.',
    risk: 'The surface is airless, cold, and exposed to radiation.',
    learningObjective: 'Prioritize essential protection and communication within a strict equipment limit.',
    badge: 'Mission Preparer',
    badgeMark: '⬡',
    event: 'A short surface excursion is scheduled.',
    startingResources: baseResources({ oxygen: 86, power: 73, health: 88 }),
    visualContext: 'A nearby EVA route leads from Habitat A to a marked sample site.',
    equipmentSlots: 5,
    essentialGear: ['oxygen-tank', 'radiation-shield', 'thermal-layer', 'comms-unit'],
    gearItems: [
      { id: 'oxygen-tank', name: 'Oxygen tank', description: 'Backup breathable air for the EVA.', icon: '◌', essential: true, benefit: 'Keeps air available outside.', tradeoff: 'Uses one slot and adds pack weight.' },
      { id: 'radiation-shield', name: 'Radiation shield', description: 'Protective layer for the surface.', icon: '◈', essential: true, benefit: 'Reduces radiation exposure.', tradeoff: 'Adds weight and limits room for tools.' },
      { id: 'thermal-layer', name: 'Thermal protection', description: 'Insulation for sharp temperature changes.', icon: '⌁', essential: true, benefit: 'Keeps body temperature safer.', tradeoff: 'Uses one of five equipment slots.' },
      { id: 'comms-unit', name: 'Communication device', description: 'Stay connected to the habitat.', icon: '⌁', essential: true, benefit: 'Lets the crew call for help.', tradeoff: 'Needs battery power.' },
      { id: 'tool-kit', name: 'Tool kit', description: 'Small tools for inspection and repair.', icon: '⚒', essential: false, benefit: 'Makes small repairs possible.', tradeoff: 'Extra weight can slow the return.' },
      { id: 'emergency-battery', name: 'Emergency battery', description: 'A reserve cell for suit or radio.', icon: 'ϟ', essential: false, benefit: 'Backup power for an emergency.', tradeoff: 'Takes space from a science tool.' },
      { id: 'sample-container', name: 'Sample container', description: 'Carry a small rock sample home.', icon: '⬡', essential: false, benefit: 'Supports the science objective.', tradeoff: 'Adds weight and is not needed for safety.' },
    ],
  },
  {
    id: 3,
    title: 'Build Your Mission Kit',
    shortTitle: 'Mission Kit',
    location: 'MOON · HABITAT A STORES',
    world: 'moon',
    mode: 'kit',
    objective: 'Pack food, water, and emergency supplies without exceeding mass or storage.',
    briefing: 'The cargo bay has a mass limit and a storage limit. Pack the essentials and at least one useful backup. You cannot bring everything, so balance safety with science.',
    missionControl: 'A resilient kit has supplies for the plan and a little room for surprises.',
    risk: 'Too little reserve makes a small repair harder; too much cargo crowds out other needs.',
    learningObjective: 'Plan supplies under both mass and storage limits while reserving an emergency option.',
    badge: 'Resource Planner',
    badgeMark: '▤',
    event: 'Cargo loading is open. Choose a kit before departure.',
    startingResources: baseResources({ water: 75, food: 70, materials: 58, power: 78 }),
    visualContext: 'A lunar cargo route links the stores module to the habitat and research dome.',
    massLimitKg: 28,
    storageLimit: 16,
    essentialSupplies: ['food-pack', 'water-pack', 'medical-kit', 'repair-tools'],
    supplies: [
      { id: 'food-pack', name: 'Food packs', description: 'Meals for the crew during the trip.', category: 'Life support', weightKg: 6, storageUnits: 4, essential: true, icon: '✳' },
      { id: 'water-pack', name: 'Water reserve', description: 'Drinking water and hygiene reserve.', category: 'Life support', weightKg: 7, storageUnits: 4, essential: true, icon: '◈' },
      { id: 'batteries', name: 'Battery cells', description: 'Portable power for tools and equipment.', category: 'Emergency', weightKg: 4, storageUnits: 2, essential: false, icon: 'ϟ' },
      { id: 'repair-tools', name: 'Repair tools', description: 'Tools to fix a small system problem.', category: 'Emergency', weightKg: 5, storageUnits: 3, essential: true, icon: '⚒' },
      { id: 'medical-kit', name: 'Medical supplies', description: 'First-aid supplies for a crew concern.', category: 'Crew care', weightKg: 2, storageUnits: 1, essential: true, icon: '✚' },
      { id: 'seeds', name: 'Crop seeds', description: 'Seeds to grow food on a longer mission.', category: 'Sustainability', weightKg: 1, storageUnits: 2, essential: false, icon: '❋' },
      { id: 'science-tools', name: 'Science instruments', description: 'Instruments for studying surface samples.', category: 'Science', weightKg: 5, storageUnits: 3, essential: false, icon: '⌬' },
      { id: 'spare-filters', name: 'Spare air filters', description: 'Backup filters for the air system.', category: 'Emergency', weightKg: 2, storageUnits: 1, essential: false, icon: '◌' },
    ],
  },

  {
    id: 4, title: 'Lunar Power Challenge', shortTitle: 'Lunar Power', location: 'MOON · POLAR RIDGE', world: 'moon', mode: 'decisions',
    objective: 'Keep life support online through a long lunar night while protecting the battery reserve.', briefing: 'Sunlight is fading. Choose what to protect first, then explain how your plan balances crew safety with science.', missionControl: 'Power is limited. Protect the systems that keep your crew safe.', risk: 'A low battery can cascade into heating and communication loss.', learningObjective: 'Prioritize essential systems during a power shortage.', badge: 'Power Guardian', badgeMark: 'ϟ', event: 'Solar input is falling below the habitat demand.', startingResources: baseResources({ power: 42, food: 76 }), visualContext: 'Long shadows stretch across the lunar solar array.',
    actions: [
      { id: 'power-life-support', title: 'Keep life support online', description: 'Protect air, heat, and communications while pausing optional work.', benefit: 'Crew systems stay stable.', cost: 'Science progress slows.', delayedRisk: 'The laboratory may miss its observation window.', outcome: 'Life support stays online while the lab waits.', resourceDelta: { power: 4, health: 2 }, delayedDelta: { food: -1 }, skillDelta: { safety: 8, planning: 5, sustainability: 4 }, causeChain: ['Battery reserve', 'Life support protected', 'Lab work delayed'], risk: 'low', best: true },
      { id: 'power-lab', title: 'Keep the laboratory running', description: 'Use the reserve to finish a valuable experiment before darkness.', benefit: 'Science data is captured.', cost: 'Battery and heating reserve fall.', delayedRisk: 'A cold habitat could reduce crew health.', outcome: 'The experiment finishes, but reserves tighten.', resourceDelta: { power: -10, health: -5 }, delayedDelta: { health: -4 }, skillDelta: { science: 8, safety: -3, planning: 3 }, causeChain: ['Battery reserve', 'Experiment completed', 'Heating margin shrinks'], risk: 'high' },
      { id: 'power-greenhouse', title: 'Reduce greenhouse lighting', description: 'Save power by dimming plant lights until sunlight returns.', benefit: 'Battery reserve improves.', cost: 'Crop growth slows.', delayedRisk: 'Food production may be lower later.', outcome: 'The habitat gains a reserve while crops grow slowly.', resourceDelta: { power: 7, food: -2 }, delayedDelta: { food: -3 }, skillDelta: { resourceManagement: 7, sustainability: 7, science: 2 }, causeChain: ['Lighting reduced', 'Battery reserve protected', 'Harvest delayed'], risk: 'low' },
    ],
  },
  {
    id: 5, title: 'Radiation and EVA Mission', shortTitle: 'Radiation EVA', location: 'MOON · SOUTH CRATER', world: 'moon', mode: 'decisions', objective: 'Complete an essential inspection without exceeding the crew radiation safety limit.', briefing: 'A warning has appeared on the surface route. Decide how much science is worth the extra exposure, then explain your safety boundary.', missionControl: 'A good EVA ends with the astronaut safely back inside.', risk: 'Extra surface time increases radiation exposure and oxygen use.', learningObjective: 'Balance science value against radiation and return safety.', badge: 'Safety Specialist', badgeMark: '◈', event: 'Radiation monitor: rising exposure on the eastern route.', startingResources: baseResources({ oxygen: 68, health: 82, materials: 64 }), visualContext: 'A shielded route leads to a crater instrument.',
    actions: [
      { id: 'eva-short', title: 'Take the shielded short route', description: 'Inspect the fault quickly and return before the warning threshold.', benefit: 'The crew stays inside the safety margin.', cost: 'Only essential data is collected.', delayedRisk: 'A later science team may need another EVA.', outcome: 'Inspection complete with a conservative exposure profile.', resourceDelta: { oxygen: -4, health: 1, materials: 3 }, delayedDelta: { food: -1 }, skillDelta: { safety: 9, planning: 6, science: 2 }, causeChain: ['Shielded route', 'Short exposure', 'Essential repair data'], risk: 'low', best: true },
      { id: 'eva-sample', title: 'Extend the EVA for a sample', description: 'Stay outside longer to collect a rare crater sample.', benefit: 'Science potential rises.', cost: 'Oxygen and health margin fall.', delayedRisk: 'A route delay could force an emergency return.', outcome: 'The sample is valuable, but the return margin is smaller.', resourceDelta: { oxygen: -10, health: -7, materials: 2 }, delayedDelta: { health: -4 }, skillDelta: { science: 9, safety: -2, planning: 4 }, causeChain: ['Longer route', 'Sample secured', 'Return margin narrows'], risk: 'high' },
      { id: 'eva-shield', title: 'Wait for a radiation lull', description: 'Pause at the shelter and use time to plan the safest inspection window.', benefit: 'Exposure risk is reduced.', cost: 'Power is used by the shelter.', delayedRisk: 'The instrument may lose its communication window.', outcome: 'The team gains information before committing to the EVA.', resourceDelta: { power: -5, health: 3, oxygen: -2 }, delayedDelta: { food: -1 }, skillDelta: { safety: 7, planning: 8, explanation: 3 }, causeChain: ['Shelter pause', 'Better information', 'Narrower science window'], risk: 'low' },
    ],
  },
  {
    id: 6, title: 'Greenhouse and Water Mission', shortTitle: 'Greenhouse', location: 'MOON · HABITAT A', world: 'moon', mode: 'decisions', objective: 'Keep the crew supplied while balancing crop growth, water recycling, and oxygen output.', briefing: 'The greenhouse can grow food and refresh air, but water and power are limited. Choose a crop plan and explain the trade-off.', missionControl: 'Healthy habitats plan for tomorrow as well as today.', risk: 'Fast growth can drain the water reserve.', learningObjective: 'Manage water, food, oxygen, and sustainable crop choices.', badge: 'Life-Support Farmer', badgeMark: '❋', event: 'Greenhouse reservoir is below its preferred level.', startingResources: baseResources({ water: 48, food: 58, power: 70, oxygen: 86 }), visualContext: 'Grow lights glow inside the transparent research dome.',
    actions: [
      { id: 'crop-efficient', title: 'Grow efficient crops', description: 'Choose slow-growing plants that use less water and keep the reserve stable.', benefit: 'Water and long-term resilience improve.', cost: 'The next harvest is smaller.', delayedRisk: 'Food variety remains limited.', outcome: 'The greenhouse becomes a reliable, low-water system.', resourceDelta: { water: 7, food: 3, oxygen: 3 }, delayedDelta: { food: 2 }, skillDelta: { sustainability: 9, resourceManagement: 7, planning: 5 }, causeChain: ['Efficient crops', 'Water reserve protected', 'Steady future harvest'], risk: 'low', best: true },
      { id: 'crop-fast', title: 'Plant fast-growing crops', description: 'Use extra water and light to produce food quickly.', benefit: 'Food rises soon.', cost: 'Water and power fall.', delayedRisk: 'The reservoir may not recover before the next cycle.', outcome: 'The crew receives a quick harvest at a resource cost.', resourceDelta: { water: -12, power: -7, food: 10, oxygen: 1 }, delayedDelta: { water: -6 }, skillDelta: { science: 5, resourceManagement: -2, sustainability: 3 }, causeChain: ['More light and water', 'Fast harvest', 'Reservoir recovery delayed'], risk: 'medium' },
      { id: 'crop-air', title: 'Prioritize oxygen plants', description: 'Favor plants that refresh air even though they produce less food.', benefit: 'Air quality improves.', cost: 'Food production slows.', delayedRisk: 'The crew will need a more careful meal plan.', outcome: 'The greenhouse acts as an air-support buffer.', resourceDelta: { oxygen: 8, food: -4, water: -3 }, delayedDelta: { food: -3 }, skillDelta: { safety: 7, sustainability: 8, planning: 4 }, causeChain: ['Oxygen plants', 'Air refreshed', 'Meal variety reduced'], risk: 'low' },
    ],
  },
  {
    id: 7, title: 'Mars Communication Delay', shortTitle: 'Signal Delay', location: 'MARS · ARES FIELD', world: 'mars', mode: 'decisions', objective: 'Act safely before Mission Control can reply to an outpost emergency.', briefing: 'Mars is far away. A message may take minutes to arrive, so choose a safe first action with incomplete information.', missionControl: 'When the signal is delayed, your plan must protect the crew before the reply.', risk: 'Waiting can allow a small leak or failure to worsen.', learningObjective: 'Make independent decisions under communication delay.', badge: 'Independent Decision-Maker', badgeMark: '⌁', event: 'Mission Control reply ETA: 11 minutes.', startingResources: baseResources({ water: 52, power: 64, health: 84, materials: 60 }), visualContext: 'A long antenna beam fades across the red Ares horizon.',
    actions: [
      { id: 'delay-isolate', title: 'Isolate the water leak', description: 'Close the affected loop while the crew checks the pipe locally.', benefit: 'Water loss slows immediately.', cost: 'One habitat section has reduced supply.', delayedRisk: 'The repair team must work efficiently.', outcome: 'The crew buys time without waiting for a reply.', resourceDelta: { water: 6, power: -2, materials: -3 }, delayedDelta: { water: 2 }, skillDelta: { emergencyResponse: 9, safety: 7, planning: 6 }, causeChain: ['Local isolation', 'Leak slows', 'Repair window opens'], risk: 'low', best: true },
      { id: 'delay-wait', title: 'Wait for Mission Control', description: 'Hold action until more information arrives from Earth.', benefit: 'The team avoids a wrong repair.', cost: 'The leak continues.', delayedRisk: 'Water may fall below the safe reserve.', outcome: 'More information arrives, but the problem has grown.', resourceDelta: { water: -9, health: -3 }, delayedDelta: { water: -7 }, skillDelta: { planning: 3, emergencyResponse: -3, explanation: 5 }, causeChain: ['Wait for signal', 'More information', 'Leak continues'], risk: 'high' },
      { id: 'delay-rover', title: 'Send the rover to inspect', description: 'Use the rover camera to gather information while the crew stays safe.', benefit: 'The team learns more without an EVA.', cost: 'Rover power and time are used.', delayedRisk: 'A rover fault could slow the response.', outcome: 'The rover returns useful evidence before the reply.', resourceDelta: { power: -7, materials: 1, water: -2 }, delayedDelta: { power: -3 }, skillDelta: { science: 6, planning: 7, emergencyResponse: 5 }, causeChain: ['Rover inspection', 'Better evidence', 'Power spent on information'], risk: 'medium' },
    ],
  },
  {
    id: 8, title: 'Dust Storm Emergency', shortTitle: 'Dust Storm', location: 'MARS · ARES FIELD', world: 'mars', mode: 'decisions', objective: 'Keep life support operating through a dust storm when not every system can be protected.', briefing: 'A storm is moving over the array. You must choose which systems to protect now and which work can wait.', missionControl: 'A storm plan is a priority list, not a promise to save everything.', risk: 'Dust can cut solar input and trap the rover outside.', learningObjective: 'Prioritize life support, power, communications, and recovery during an emergency.', badge: 'Storm Commander', badgeMark: '✦', event: 'Dust storm front arriving in 6 minutes.', startingResources: baseResources({ power: 38, oxygen: 74, water: 66, materials: 55, health: 86 }), visualContext: 'Red dust sweeps around the habitat while the beacon flashes.',
    actions: [
      { id: 'storm-life', title: 'Protect life support', description: 'Shut down experiments and reserve battery for habitat systems.', benefit: 'Crew safety remains stable.', cost: 'Science and rover work pause.', delayedRisk: 'The repair queue grows.', outcome: 'The habitat rides out the first storm wave safely.', resourceDelta: { power: 8, health: 3 }, delayedDelta: { materials: -2 }, skillDelta: { safety: 9, emergencyResponse: 8, planning: 6 }, causeChain: ['Experiments paused', 'Battery reserved', 'Life support stable'], risk: 'low', best: true },
      { id: 'storm-rover', title: 'Bring the rover home', description: 'Spend power and expose the rover briefly to retrieve it before visibility drops.', benefit: 'A valuable repair asset returns.', cost: 'Power and materials are spent.', delayedRisk: 'The array remains dirty during the storm.', outcome: 'The rover reaches shelter with a narrow margin.', resourceDelta: { power: -11, materials: -2, health: -1 }, delayedDelta: { power: -4 }, skillDelta: { emergencyResponse: 7, planning: 5, science: 3 }, causeChain: ['Rover retrieval', 'Repair asset protected', 'Battery margin narrows'], risk: 'medium' },
      { id: 'storm-experiment', title: 'Keep the experiment running', description: 'Use the reserve to preserve a rare atmospheric measurement.', benefit: 'Science data is captured.', cost: 'Battery and crew reserve fall.', delayedRisk: 'The storm could outlast the reserve.', outcome: 'A unique measurement arrives, but the habitat has less margin.', resourceDelta: { power: -13, health: -6 }, delayedDelta: { power: -8, health: -3 }, skillDelta: { science: 9, safety: -4, explanation: 4 }, causeChain: ['Experiment powered', 'Science captured', 'Storm reserve reduced'], risk: 'high' },
    ],
  },
  {
    id: 9, title: 'Crew Health and Teamwork', shortTitle: 'Crew Health', location: 'MARS · HABITAT A', world: 'mars', mode: 'decisions', objective: 'Balance rest, maintenance, science, and teamwork while the crew faces fatigue.', briefing: 'The crew has an experiment deadline and a maintenance queue. A safe commander protects people as well as schedules.', missionControl: 'A rested crew makes better decisions and recovers faster.', risk: 'Fatigue can turn a small disagreement into a safety problem.', learningObjective: 'Use teamwork and recovery planning to protect crew health.', badge: 'Crew Leader', badgeMark: '◎', event: 'Crew fatigue index is rising after three long shifts.', startingResources: baseResources({ health: 57, power: 62, food: 72, materials: 63 }), visualContext: 'Warm habitat lights shift to a calm rest-cycle palette.',
    actions: [
      { id: 'crew-rest', title: 'Schedule rest and reassign work', description: 'Delay optional science, rotate maintenance, and give the tired crew time to recover.', benefit: 'Health and teamwork improve.', cost: 'The experiment deadline moves.', delayedRisk: 'Some science data may be lost.', outcome: 'The team recovers and completes the essential maintenance.', resourceDelta: { health: 12, materials: 3 }, delayedDelta: { food: -1 }, skillDelta: { teamwork: 10, safety: 6, emergencyResponse: 4 }, causeChain: ['Work reassigned', 'Crew rests', 'Science deadline moves'], risk: 'low', best: true },
      { id: 'crew-science', title: 'Push through the experiment', description: 'Keep the same schedule so the deadline is met.', benefit: 'Science output is protected.', cost: 'Fatigue and disagreement rise.', delayedRisk: 'An exhausted crew may miss a maintenance warning.', outcome: 'The experiment finishes, but team capacity falls.', resourceDelta: { health: -12, materials: -2 }, delayedDelta: { health: -7 }, skillDelta: { science: 8, teamwork: -4, safety: -3 }, causeChain: ['Deadline protected', 'Crew fatigue rises', 'Maintenance margin shrinks'], risk: 'high' },
      { id: 'crew-robot', title: 'Ask the robot to help', description: 'Use the robot for a routine task while the crew handles the medical concern.', benefit: 'Essential work continues safely.', cost: 'Power is used and science is delayed.', delayedRisk: 'The robot battery needs a recharge cycle.', outcome: 'The crew stays available for the human problem.', resourceDelta: { health: 5, power: -7, materials: 2 }, delayedDelta: { power: -2 }, skillDelta: { teamwork: 8, emergencyResponse: 7, planning: 5 }, causeChain: ['Robot assigned', 'Crew capacity protected', 'Battery recharge needed'], risk: 'low' },
    ],
  },
  {
    id: 10, title: 'Mission Commander Challenge', shortTitle: 'Command', location: 'MARS · ARES FIELD', world: 'mars', mode: 'decisions', objective: 'Prioritize a storm, a stopped water recycler, a greenhouse, and an astronaut repairing the solar array.', briefing: 'This is your capstone. Mission Control cannot respond immediately. Choose the first action that keeps the crew safe, then explain your command decision.', missionControl: 'Command is choosing what must happen first—and telling the crew why.', risk: 'A rushed priority can trade short-term science for long-term safety.', learningObjective: 'Combine resource management, emergency response, safety, teamwork, sustainability, science, and reasoning.', badge: 'Junior Mission Commander', badgeMark: '★', event: 'Storm approaching · recycler stopped · EVA in progress · response delayed.', startingResources: baseResources({ oxygen: 68, water: 34, power: 36, food: 61, materials: 49, health: 72 }), visualContext: 'The full Ares outpost glows beneath a storm wall and a blinking EVA marker.',
    actions: [
      { id: 'command-safety', title: 'Recall the astronaut and protect life support', description: 'Stop optional work, isolate the recycler, and bring the EVA crew home before the storm.', benefit: 'The crew and core systems gain the best safety margin.', cost: 'Greenhouse output and science pause.', delayedRisk: 'Food reserves may need careful management later.', outcome: 'The command protects the crew first and creates a repair window.', resourceDelta: { health: 7, oxygen: 3, water: 5, power: 5, materials: -2 }, delayedDelta: { food: -3 }, skillDelta: { safety: 10, emergencyResponse: 10, teamwork: 8, resourceManagement: 7, planning: 8, sustainability: 4, explanation: 6 }, causeChain: ['Recall EVA', 'Core systems protected', 'Science and greenhouse delayed'], risk: 'low', best: true },
      { id: 'command-greenhouse', title: 'Power the greenhouse first', description: 'Keep food and oxygen production running while the astronaut finishes the array repair.', benefit: 'Sustainability and food production continue.', cost: 'The storm may catch the astronaut outside.', delayedRisk: 'Crew health and water loss could worsen.', outcome: 'The greenhouse stays productive, but the outside repair is riskier.', resourceDelta: { power: -8, food: 5, oxygen: 2, health: -8, water: -6 }, delayedDelta: { health: -6 }, skillDelta: { sustainability: 8, science: 4, safety: -4, resourceManagement: 5 }, causeChain: ['Greenhouse powered', 'Food and air improve', 'EVA remains exposed'], risk: 'high' },
      { id: 'command-repair', title: 'Send the robot to the array', description: 'Use the robot to support the repair while the crew seals the recycler loop.', benefit: 'Power and water recovery can restart together.', cost: 'Robot battery and materials are spent.', delayedRisk: 'The robot may be unavailable for later work.', outcome: 'A coordinated response protects multiple systems without adding EVA exposure.', resourceDelta: { power: 6, water: 8, materials: -7, health: 2, oxygen: 1 }, delayedDelta: { power: -3 }, skillDelta: { teamwork: 10, resourceManagement: 8, planning: 7, emergencyResponse: 8, science: 2 }, causeChain: ['Robot supports repair', 'Power and water recover', 'Robot reserve falls'], risk: 'low' },
    ],
  },
]

export const getLevel = (id: number): MissionLevel | undefined => LEVELS.find(level => level.id === id)
export const getLevelSummary = (id: number): LevelSummary | undefined => LEVEL_TITLES.find(level => level.id === id)
