/**
 * Space glossary. Every entry has a short "simple" definition for younger learners and a
 * slightly fuller "detail" line for older students and teachers. Entries also point at the
 * training levels where the term appears so the glossary stays connected to the missions.
 */
export type GlossaryCategory = 'Life support' | 'Power' | 'Space weather' | 'Exploration' | 'Learning'

export type GlossaryEntry = {
  id: string
  term: string
  simple: string
  detail: string
  category: GlossaryCategory
  levels: number[]
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = ['Life support', 'Power', 'Space weather', 'Exploration', 'Learning']

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'oxygen', term: 'Oxygen', category: 'Life support', levels: [1, 3, 10],
    simple: 'The gas your body needs to breathe.',
    detail: 'The outpost makes and stores oxygen so the crew can breathe. A clogged filter or a leak can lower the supply quickly, which is why oxygen is checked before every mission.',
  },
  {
    id: 'water-recycler', term: 'Water recycler', category: 'Life support', levels: [1, 6, 10],
    simple: 'A machine that cleans used water so it can be drunk again.',
    detail: 'Recycling keeps water in the loop instead of launching new water from Earth. If the recycler stops, the clean-water tank drops and every activity that needs water competes for what is left.',
  },
  {
    id: 'thermal-control', term: 'Thermal control', category: 'Life support', levels: [1, 2, 10],
    simple: 'The system that keeps the habitat and suit at a safe temperature.',
    detail: 'Space swings between very hot sunlight and very cold shadow. Thermal control moves heat around so people, plants, and equipment stay inside safe limits.',
  },
  {
    id: 'greenhouse', term: 'Greenhouse', category: 'Life support', levels: [6, 8, 10],
    simple: 'A garden in space that grows food for the crew.',
    detail: 'Plants provide food and add oxygen, but they also need light, water, and a steady temperature. Fast-growing crops usually drink more water than slow, efficient crops.',
  },
  {
    id: 'habitat', term: 'Habitat', category: 'Exploration', levels: [1, 4, 8, 10],
    simple: 'The home base where the crew lives and works.',
    detail: 'A habitat protects the crew from vacuum, radiation, and temperature extremes. Its life-support, power, and communication systems are linked, so protecting one often affects another.',
  },
  {
    id: 'solar-array', term: 'Solar array', category: 'Power', levels: [4, 8, 10],
    simple: 'Panels that turn sunlight into electricity.',
    detail: 'Solar panels charge the outpost batteries. During a lunar night or a dust storm, generation falls and the crew must decide which systems keep running.',
  },
  {
    id: 'battery-reserve', term: 'Battery reserve', category: 'Power', levels: [4, 8, 10],
    simple: 'Saved electricity for when the Sun is not shining.',
    detail: 'A reserve is power the crew has not spent yet. Keeping some in reserve protects life support if a storm or equipment failure cuts generation.',
  },
  {
    id: 'life-support', term: 'Life support', category: 'Life support', levels: [1, 4, 7, 10],
    simple: 'All the systems that keep people alive: air, water, food, and temperature.',
    detail: 'Life support is usually the first priority because the crew cannot wait for it. Protecting it may mean pausing science or reducing comfort elsewhere.',
  },
  {
    id: 'communication-delay', term: 'Communication delay', category: 'Exploration', levels: [7, 10],
    simple: 'The time it takes a message to travel between Earth and the crew.',
    detail: 'Radio signals take seconds to reach the Moon and several minutes to reach Mars. During a delay the crew must act on their own training and explain the decision afterwards.',
  },
  {
    id: 'eva', term: 'EVA (spacewalk)', category: 'Exploration', levels: [2, 5, 10],
    simple: 'Work done outside the habitat in a spacesuit.',
    detail: 'An extravehicular activity needs a suit with air, thermal protection, radiation shielding, and a communication link. Every extra item adds capability but also weight and air use.',
  },
  {
    id: 'spacesuit', term: 'Spacesuit', category: 'Exploration', levels: [2, 5],
    simple: 'A small, wearable spacecraft that protects an astronaut.',
    detail: 'A suit is a portable life-support system. It has limited slots for equipment, so astronauts trade tools, samples, and backup power against each other.',
  },
  {
    id: 'radiation', term: 'Radiation', category: 'Space weather', levels: [2, 5, 10],
    simple: 'Invisible energy from the Sun and space that can harm the body.',
    detail: 'Without an atmosphere, astronauts receive more radiation. Shielding, shorter surface time, and careful route planning reduce exposure.',
  },
  {
    id: 'solar-flare', term: 'Solar flare', category: 'Space weather', levels: [1, 4, 5, 10],
    simple: 'A sudden burst of energy from the Sun.',
    detail: 'Flares are ranked by class, from small C-class events to powerful X-class events. A large flare can disturb radio signals and is often followed by other space-weather effects.',
  },
  {
    id: 'cme', term: 'Coronal mass ejection (CME)', category: 'Space weather', levels: [4, 5, 8, 10],
    simple: 'A huge cloud of charged particles blown out by the Sun.',
    detail: 'A CME travels through space for hours or days. When it reaches a spacecraft it can raise radiation levels and disturb communications and power systems.',
  },
  {
    id: 'geomagnetic-storm', term: 'Geomagnetic storm', category: 'Space weather', levels: [5, 8],
    simple: 'A disturbance in Earth’s magnetic field caused by solar activity.',
    detail: 'Geomagnetic storms are rated G1 to G5. They can affect satellites, radio links, and power grids on Earth, which is why mission planners watch space weather closely.',
  },
  {
    id: 'sep-event', term: 'Solar energetic particles', category: 'Space weather', levels: [2, 5, 10],
    simple: 'Fast-moving particles from the Sun that can be dangerous outside.',
    detail: 'Solar energetic particle events, rated S1 to S5, arrive quickly and are a serious risk during an EVA. Crews shorten surface time or postpone work when levels rise.',
  },
  {
    id: 'radio-blackout', term: 'Radio blackout', category: 'Space weather', levels: [1, 7],
    simple: 'When a solar burst makes radio communication difficult.',
    detail: 'Radio blackouts are rated R1 to R5 and can interrupt the link between the crew and Mission Control, forcing the crew to make decisions with incomplete information.',
  },
  {
    id: 'donki', term: 'NASA DONKI', category: 'Space weather', levels: [4, 5, 7, 8, 10],
    simple: 'A NASA service that shares notices about space weather.',
    detail: 'DONKI stands for the Database Of Notifications, Knowledge, Information. It collects reports about flares, CMEs, geomagnetic storms, and radiation so researchers and mission planners can follow solar activity. ASTRA Junior uses DONKI-style training notices, not live NASA data.',
  },
  {
    id: 'lunar-night', term: 'Lunar night', category: 'Power', levels: [4],
    simple: 'Two weeks of darkness on the Moon.',
    detail: 'A lunar night lasts about 14 Earth days. Solar panels stop charging, so the crew relies on batteries and must decide which systems to pause.',
  },
  {
    id: 'dust-storm', term: 'Dust storm', category: 'Exploration', levels: [8, 10],
    simple: 'A wall of dust on Mars that blocks sunlight.',
    detail: 'Martian dust storms can last weeks and coat solar panels. They are a local weather hazard, not a solar event, but they create the same command problem: not every system can be protected equally.',
  },
  {
    id: 'trade-off', term: 'Trade-off', category: 'Learning', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    simple: 'Giving something up to get something more important.',
    detail: 'A trade-off has a benefit and a cost. Good mission reasoning names both, then explains why the benefit mattered more at that moment.',
  },
  {
    id: 'readiness', term: 'Mission readiness', category: 'Learning', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    simple: 'How prepared you are, based on safety, planning, science, and teamwork.',
    detail: 'The readiness score combines eight skill areas. It rewards safe choices and clear reasoning, not just finishing the mission or keeping every resource full.',
  },
  {
    id: 'mission-memory', term: 'Mission memory', category: 'Learning', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    simple: 'The record of what you decided and what happened next.',
    detail: 'Mission memory stores each decision, its consequence, and your explanation. Reviewing it shows which systems you protected and which you neglected.',
  },
  {
    id: 'sustainability', term: 'Sustainability', category: 'Learning', levels: [3, 6, 8, 10],
    simple: 'Using resources carefully so they last.',
    detail: 'A sustainable plan recycles water, keeps reserves for emergencies, and avoids spending everything on one problem. It is one of the eight readiness skills.',
  },
]

const normalise = (value: string): string => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

/** Filter glossary entries by free-text query and optional category. Pure and unit tested. */
export function searchGlossary(query = '', category: GlossaryCategory | 'All' = 'All'): GlossaryEntry[] {
  const needle = normalise(query)
  return GLOSSARY.filter(entry => {
    if (category !== 'All' && entry.category !== category) return false
    if (!needle) return true
    return normalise(entry.term).includes(needle)
      || normalise(entry.simple).includes(needle)
      || normalise(entry.detail).includes(needle)
  })
}

export function glossaryForLevel(levelId: number): GlossaryEntry[] {
  return GLOSSARY.filter(entry => entry.levels.includes(levelId))
}
