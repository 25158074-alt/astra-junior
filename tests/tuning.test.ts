import { afterEach, describe, expect, it } from 'vitest'
import { CONFIG, DEFAULT_CONFIG } from '../src/game/config'
import { tuning } from '../src/game/tuning'

const defaults = Object.fromEntries(tuning.controls.map(control => [control.id, control.default]))

afterEach(() => {
  tuning.apply(defaults)
})

describe('ASTRA Three.js preview tuning', () => {
  it('registers only controls used by the outpost scene and preserves their config defaults', () => {
    expect(tuning.controls.map(control => control.id)).toEqual([
      'camera.fov', 'camera.distance', 'camera.follow',
      'outpost.orbitSpeed', 'outpost.signalGlow', 'outpost.zoomStep',
    ])
    expect(tuning.controls.every(control => control.integrity === 'COSMETIC')).toBe(true)
    expect(tuning.controls.find(control => control.id === 'camera.fov')?.default).toBe(DEFAULT_CONFIG.camera.fov)
    expect(tuning.controls.find(control => control.id === 'outpost.signalGlow')?.default).toBe(DEFAULT_CONFIG.outpost.signalGlow)
  })

  it('validates the complete patch before applying any config changes', () => {
    const before = tuning.read()
    expect(() => tuning.apply({ 'camera.fov': 90, 'outpost.signalGlow': 1 })).toThrow()
    expect(tuning.read()).toEqual(before)
    expect(CONFIG.camera.fov).toBe(DEFAULT_CONFIG.camera.fov)
    expect(() => tuning.apply({ 'outpost.orbitSpeed': 0.037 })).toThrow()
    expect(() => tuning.apply({ unknown: 1 })).toThrow()
    expect(() => tuning.apply({ 'camera.fov': Infinity })).toThrow()
  })

  it('applies live camera, zoom, orbit, and signal values to the shared game-owned config', () => {
    tuning.apply({ 'camera.fov': 84, 'camera.distance': 8, 'camera.follow': 14,
      'outpost.orbitSpeed': 0.055, 'outpost.signalGlow': 0.42, 'outpost.zoomStep': 0.2 })
    expect(CONFIG.camera).toMatchObject({ fov: 84, distance: 8, follow: 14 })
    expect(CONFIG.outpost).toMatchObject({ orbitSpeed: 0.055, signalGlow: 0.42, zoomStep: 0.2 })
    expect(tuning.read().active['camera.fov']).toBe(84)
    expect(tuning.unranked).toBe(false)
  })
})
