export type DonkiCmeRecord = {
  activityID: string
  startTime: string
  sourceLocation: string
  catalog: string
  note: string
  speedKmS: number | null
  halfAngle: number | null
  analysisTime: string | null
  link: string
}

export type DonkiSnapshot = {
  dataset: string
  retrievedAt: string
  window: { startDate: string; endDate: string }
  sourceUrl: string
  provider: string
  records: DonkiCmeRecord[]
}

export const DONKI_SOURCE_URL = 'https://ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=2026-10-27&endDate=2026-11-02'
export const DONKI_VIEW_URL = 'https://ccmc.gsfc.nasa.gov/tools/DONKI/'

export async function loadDonkiSnapshot(): Promise<DonkiSnapshot | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/donki-cme-snapshot.json`, { cache: 'no-cache' })
    if (!response.ok) return null
    const data = await response.json() as DonkiSnapshot
    if (!data || !Array.isArray(data.records) || !data.sourceUrl) return null
    return data
  } catch {
    return null
  }
}

export function latestDonkiCme(snapshot: DonkiSnapshot | null): DonkiCmeRecord | null {
  if (!snapshot?.records.length) return null
  return [...snapshot.records].reverse().find(record => Number.isFinite(record.speedKmS)) ?? snapshot.records.at(-1) ?? null
}

export function maxDonkiSpeed(snapshot: DonkiSnapshot | null): number | null {
  const speeds = snapshot?.records.map(record => record.speedKmS).filter((speed): speed is number => Number.isFinite(speed)) ?? []
  return speeds.length ? Math.max(...speeds) : null
}

/** Educational index only: it is not a radiation dose or operational forecast. */
export function donkiRiskIndex(speedKmS: number | null): number | null {
  return speedKmS === null ? null : Math.min(100, Math.max(0, Math.round(speedKmS / 10)))
}

export function donkiTrainingBand(speedKmS: number | null): { label: string; tone: 'low' | 'watch' | 'high'; explanation: string } {
  if (speedKmS === null) return { label: 'DATA UNAVAILABLE', tone: 'watch', explanation: 'Use the authored safety scenario while the archived NASA dataset is unavailable.' }
  if (speedKmS >= 700) return { label: 'HIGH-SPEED EVENT', tone: 'high', explanation: 'The archived CME speed is high for this training scenario; prioritize shelter and exposure planning.' }
  if (speedKmS >= 400) return { label: 'SPACE-WEATHER WATCH', tone: 'watch', explanation: 'The archived CME speed raises the training need to plan shielding and safe EVA timing.' }
  return { label: 'LOWER-SPEED EVENT', tone: 'low', explanation: 'The archived CME is a lower-speed event in this training snapshot; shielding and safe EVA timing still matter.' }
}

export function formatDonkiDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
