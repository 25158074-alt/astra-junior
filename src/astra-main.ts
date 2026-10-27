import './styles/main.css'
import './styles/mission.css'
import { Audio } from './engine/audio'
import { I18n } from './engine/i18n'
import { SaveStore } from './engine/save'
import { tuning } from './game/tuning'

async function boot(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#game')
  const loading = document.getElementById('boot-screen')
  if (!canvas) throw new Error('The outpost display could not be started.')
  const settings = new SaveStore()
  const i18n = new I18n('en')
  const audio = new Audio()
  audio.setVolumes(settings.data.musicVolume, settings.data.sfxVolume, settings.data.muted)
  const [{ Renderer }, { MissionUI }] = await Promise.all([
    import('./engine/renderer'),
    import('./ui/mission-ui'),
  ])
  const renderer = new Renderer(canvas, settings.data.quality)
  const ui = new MissionUI(canvas, renderer, settings, audio, i18n)
  loading?.classList.add('boot-done')
  loading?.setAttribute('aria-hidden', 'true')

  if (import.meta.env.DEV) {
    const { registerGameTuning } = await import('../scripts/manus-tuning/adapter.js')
    await registerGameTuning(tuning)
  }

  let previous = performance.now()
  const frame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000))
    previous = now
    ui.update(dt)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
  window.addEventListener('pagehide', () => { ui.dispose(); audio.stopMusic() }, { once: true })
  ;(window as Window & { __astra?: unknown }).__astra = { ui, settings, tuning }
}

boot().catch(error => {
  console.error(error)
  const loading = document.getElementById('boot-screen')
  if (loading) {
    loading.innerHTML = `<div class="boot-mark" aria-hidden="true">✦</div><b>MISSION CONTROL CHECK</b><p>${String((error as Error)?.message ?? error).replace(/[<>&]/g, '')}</p><button type="button" onclick="location.reload()">RETRY CONNECTION</button>`
  }
})
