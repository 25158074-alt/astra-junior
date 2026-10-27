declare module '../scripts/manus-tuning/adapter.js' {
  export function registerGameTuning(store: unknown, scope?: Window): Promise<() => void>
}
