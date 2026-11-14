/**
 * NASA DONKI-style space-weather training notices.
 *
 * These notices are simulated classroom scenarios built from the same event vocabulary that
 * NASA's DONKI service (Database Of Notifications, Knowledge, Information) publishes: solar
 * flares, coronal mass ejections, geomagnetic storms, solar energetic particles, and radio
 * blackouts. They are NOT live NASA data and must never be presented as an operational feed.
 */
export type SolarActivity = 'quiet' | 'active' | 'storm'

export type SpaceWeatherNotice = {
  id: string
  level: number
  headline: string
  eventType: string
  scale: string
  activity: SolarActivity
  whatHappened: string
  whyItMatters: string
  crewAction: string
  donkiLearning: string
  affectedSystems: string[]
}

export const SPACE_WEATHER_DISCLAIMER =
  'Training simulation only. These DONKI-style notices are written for this activity and are not live NASA data.'

export const SPACE_WEATHER_NOTICES: SpaceWeatherNotice[] = [
  {
    id: 'sw-01', level: 1, headline: 'Small flare, small effects', eventType: 'Solar flare', scale: 'C-class · R1 radio blackout', activity: 'active',
    whatHappened: 'A C-class flare briefly disturbed high-frequency radio links while the crew ran a systems check.',
    whyItMatters: 'Small events are useful practice: the outpost keeps operating, but the crew notices which system depends on a clear signal.',
    crewAction: 'Match each clue to the system it protects, and note that communications is a system you can lose without losing air.',
    donkiLearning: 'DONKI groups flare reports with radio-blackout scales so a small event can be understood without alarm.',
    affectedSystems: ['Communications', 'Power'],
  },
  {
    id: 'sw-02', level: 2, headline: 'Particle levels rising before an EVA', eventType: 'Solar energetic particles', scale: 'S1 radiation storm', activity: 'active',
    whatHappened: 'A small solar energetic particle event raised the radiation dose expected on the surface.',
    whyItMatters: 'The suit loadout must answer a new question: does the extra science tool matter more than shielding and return time?',
    crewAction: 'Keep the four safety essentials, and treat the optional slot as a trade between science, repair, and protection.',
    donkiLearning: 'Particle events arrive fast, so DONKI notices are often shorter-fuse warnings than CME arrival forecasts.',
    affectedSystems: ['Crew health', 'Communications'],
  },
  {
    id: 'sw-03', level: 3, headline: 'CME launched, arrival still uncertain', eventType: 'Coronal mass ejection', scale: 'Earth-directed CME · arrival pending', activity: 'active',
    whatHappened: 'A coronal mass ejection left the Sun. Its arrival time and strength are still being modelled.',
    whyItMatters: 'Cargo planning has to work even if a storm delays a resupply or changes the radiation forecast.',
    crewAction: 'Pack a kit that can survive a delay: food, water, medical supplies, repair tools, and a backup system.',
    donkiLearning: 'DONKI publishes CME analyses with modelled arrival windows, which is why planners keep a reserve instead of spending it all.',
    affectedSystems: ['Food', 'Water', 'Materials'],
  },
  {
    id: 'sw-04', level: 4, headline: 'Flare activity during the lunar night', eventType: 'Solar flare', scale: 'M5 flare · R2 radio blackout', activity: 'storm',
    whatHappened: 'A medium flare disturbed communications just as the outpost entered two weeks of darkness.',
    whyItMatters: 'With no sunlight, the battery reserve is the only buffer. A communications outage removes the easy way to ask for help.',
    crewAction: 'Keep life support online, protect the battery reserve, and decide which non-critical systems can pause.',
    donkiLearning: 'DONKI separates the flare (minutes) from its radio effects (tens of minutes), so crews can plan around both.',
    affectedSystems: ['Power', 'Communications', 'Thermal control'],
  },
  {
    id: 'sw-05', level: 5, headline: 'Radiation storm during a surface inspection', eventType: 'Solar energetic particles', scale: 'S2 radiation storm', activity: 'storm',
    whatHappened: 'Particle flux rose while an inspection was already in progress outside the habitat.',
    whyItMatters: 'Every extra minute outside adds exposure. The science sample is valuable, but the crew must come home safely.',
    crewAction: 'Shorten the route, use shielding, and explain why the inspection stopped when it did.',
    donkiLearning: 'S-scale radiation storms are exactly the notices that make EVA planners shorten or delay surface work.',
    affectedSystems: ['Crew health', 'Science'],
  },
  {
    id: 'sw-06', level: 6, headline: 'Storm arrives; greenhouse water demand climbs', eventType: 'Geomagnetic storm', scale: 'G1 storm · minor', activity: 'active',
    whatHappened: 'A minor geomagnetic storm slightly reduced the solar power available to the greenhouse.',
    whyItMatters: 'Less light means slower growth, but fast crops still drink the same water. The crew must choose between harvest size and water reserve.',
    crewAction: 'Balance lighting, crop choice, and recycling so the crew stays supplied without emptying the water tank.',
    donkiLearning: 'Geomagnetic storms are rated G1–G5. A G1 event is a reminder, not an emergency, but it still changes a plan.',
    affectedSystems: ['Water', 'Food', 'Power'],
  },
  {
    id: 'sw-07', level: 7, headline: 'Radio blackout during a Mars delay', eventType: 'Radio blackout', scale: 'R2 blackout · signal degraded', activity: 'storm',
    whatHappened: 'A flare-driven radio blackout degraded the link while the crew was already waiting out the Mars communication delay.',
    whyItMatters: 'The crew cannot wait for permission that will not arrive. Acting early may prevent harm, but acting without full information carries risk.',
    crewAction: 'Choose the action that prevents the most serious harm, then explain the uncertainty you accepted.',
    donkiLearning: 'DONKI radio-blackout reports help crews recognise when a missing reply is caused by the Sun, not by a mistake.',
    affectedSystems: ['Communications', 'Water', 'Power'],
  },
  {
    id: 'sw-08', level: 8, headline: 'Not every hazard comes from the Sun', eventType: 'Local dust storm', scale: 'Solar activity: quiet', activity: 'quiet',
    whatHappened: 'The Sun is quiet, but a regional dust storm is blocking sunlight and coating the solar array.',
    whyItMatters: 'This is a local weather hazard, not a space-weather event. Comparing the two builds a more accurate picture of mission risk.',
    crewAction: 'Protect life support with the power you have, and accept that some experiments cannot be saved.',
    donkiLearning: 'DONKI tracks solar-driven hazards. Mission planners must also watch local environment hazards that no solar monitor will report.',
    affectedSystems: ['Power', 'Science', 'Communications'],
  },
  {
    id: 'sw-09', level: 9, headline: 'Quiet Sun, tired crew', eventType: 'No active space weather', scale: 'Background levels', activity: 'quiet',
    whatHappened: 'Solar activity is low, so the risk this shift comes from fatigue, disagreement, and workload.',
    whyItMatters: 'Human factors are a mission system too. A quiet Sun does not mean a safe mission if the crew is exhausted.',
    crewAction: 'Rebalance work, rest, and maintenance so the essential tasks still finish.',
    donkiLearning: 'When no DONKI notice is active, attention shifts to crew health and planning — the risks the crew controls directly.',
    affectedSystems: ['Crew health', 'Teamwork'],
  },
  {
    id: 'sw-10', level: 10, headline: 'Storm stack during the command capstone', eventType: 'Flare + CME + particle event', scale: 'X-class flare · S2 storm · CME arriving', activity: 'storm',
    whatHappened: 'An X-class flare, a radiation storm, and an arriving CME overlap while the recycler is stopped and an astronaut is outside.',
    whyItMatters: 'Several hazards compete at once. Command means choosing what must be protected first, not what can all be saved.',
    crewAction: 'Protect the crew and life support first, bring the EVA home, then recover the recycler and science.',
    donkiLearning: 'DONKI reports events separately. Commanders combine them into one picture and decide under uncertainty.',
    affectedSystems: ['Crew health', 'Power', 'Water', 'Communications'],
  },
]

export function spaceWeatherForLevel(levelId: number): SpaceWeatherNotice {
  return SPACE_WEATHER_NOTICES.find(notice => notice.level === levelId) ?? SPACE_WEATHER_NOTICES[0]
}

export const activityLabel = (activity: SolarActivity): string =>
  activity === 'storm' ? 'STORM WATCH' : activity === 'active' ? 'ACTIVE SUN' : 'QUIET SUN'
