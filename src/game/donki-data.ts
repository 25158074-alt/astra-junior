export const DONKI_SOURCE_URL = 'https://ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=2026-10-27&endDate=2026-11-02'
export const DONKI_VIEW_URL = 'https://ccmc.gsfc.nasa.gov/tools/DONKI/'
export type DonkiCmeRecord = { activityID: string; startTime: string; speedKmS: number | null }
export type DonkiSnapshot = { dataset: string; sourceUrl: string; informationUrl: string; retrievedAt: string; window: { startDate: string; endDate: string }; records: DonkiCmeRecord[] }

export async function loadDonkiSnapshot(): Promise<DonkiSnapshot | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/donki-cme-snapshot.json`, { cache: 'no-cache' })
    if (!response.ok) return null
    const value = await response.json() as Partial<DonkiSnapshot>
    if (!Array.isArray(value.records) || !value.window || typeof value.retrievedAt !== 'string') return null
    return value as DonkiSnapshot
  } catch { return null }
}

export function latestDonkiCme(snapshot: DonkiSnapshot | null): DonkiCmeRecord | null {
  if (!snapshot?.records.length) return null
  return [...snapshot.records].reverse().find(record => Number.isFinite(record.speedKmS)) ?? snapshot.records.at(-1) ?? null
}

export function maxDonkiSpeed(snapshot: DonkiSnapshot | null): number | null {
  const speeds = snapshot?.records.map(record => record.speedKmS).filter((speed): speed is number => Number.isFinite(speed)) ?? []
  return speeds.length ? Math.max(...speeds) : null
}

/** Educational index only: not a radiation dose, forecast, or operational guidance. */
export function donkiRiskIndex(speedKmS: number | null): number | null {
  return speedKmS === null ? null : Math.min(100, Math.max(0, Math.round(speedKmS / 10)))
}

export function formatDonkiDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
