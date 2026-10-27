import * as THREE from 'three'
import { CONFIG } from './config'
import type { Renderer } from '../engine/renderer'
import type { MissionLevel, ResourceValues } from './mission-data'

const material = (color: string, roughness = 0.72, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra })

/** Procedural, original miniature outpost. All scenery is built from lightweight Three.js primitives. */
export class OutpostScene {
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(37, 1, 0.1, 90)
  reducedMotion = false
  private readonly terrain: THREE.Mesh
  private readonly habitatGlass: THREE.MeshStandardMaterial
  private readonly signal: THREE.Mesh
  private readonly signalHalo: THREE.Mesh
  private readonly rover: THREE.Group
  private readonly panels: THREE.MeshStandardMaterial
  private readonly dust: THREE.Points
  private clock = 0
  private zoom = 1
  private spin = 0
  private disposed = false
  constructor(private readonly renderer: Renderer, canvas: HTMLCanvasElement, level: MissionLevel, resources: ResourceValues) {
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', '3D outpost scene with Habitat A, a research dome, solar arrays, communications tower, and rover. Use the nearby zoom and reset controls to change the view.')
    this.camera.fov = CONFIG.camera.fov
    this.camera.position.set(13, 11, 17)
    this.camera.lookAt(0, 0.8, 0)
    this.scene.background = new THREE.Color('#071425')
    this.scene.fog = new THREE.FogExp2('#0a1930', 0.012)

    this.scene.add(new THREE.HemisphereLight('#bdefff', '#2c3447', 2.05))
    const key = new THREE.DirectionalLight('#fff1d1', 3.1)
    key.position.set(-8, 15, 9)
    key.castShadow = false
    this.scene.add(key)
    const cyanRim = new THREE.PointLight('#4fdff7', 28, 22, 2)
    cyanRim.position.set(0, 6, -9)
    this.scene.add(cyanRim)

    const ground = new THREE.Mesh(new THREE.CircleGeometry(12, 64), material('#242e3d', 1))
    ground.name = 'ground'
    ground.rotation.x = -Math.PI / 2
    ground.scale.set(1.45, 1, 1)
    ground.position.y = -0.08
    ground.receiveShadow = true
    this.scene.add(ground)
    this.terrain = new THREE.Mesh(new THREE.SphereGeometry(10, 42, 24), material('#384353', 0.98))
    this.terrain.scale.set(1.35, 0.19, 0.9)
    this.terrain.position.set(0, -1.12, -0.3)
    this.terrain.receiveShadow = true
    this.scene.add(this.terrain)
    this.addCrater(-8, -1.2, 1.7)
    this.addCrater(7, 2, 1.1)
    this.addRidge()

    const grid = new THREE.Group()
    for (let i = -9; i <= 9; i += 3) {
      const points = [new THREE.Vector3(i, 0.018, -8), new THREE.Vector3(i, 0.018, 8)]
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#738ba4', transparent: true, opacity: 0.09 }))
      const cross = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11, 0.019, i), new THREE.Vector3(11, 0.019, i)]), new THREE.LineBasicMaterial({ color: '#738ba4', transparent: true, opacity: 0.09 }))
      grid.add(line, cross)
    }
    this.scene.add(grid)

    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.3, 0.26, 48), material('#536174', 0.56, { metalness: 0.44 }))
    base.position.set(-1.6, 0.14, 0.2)
    this.scene.add(base)
    const habitatBase = new THREE.Mesh(new THREE.CylinderGeometry(1.92, 2.04, 0.12, 48), material('#9ab6c7', 0.42, { metalness: 0.55 }))
    habitatBase.position.set(-1.6, 0.33, 0.2)
    this.scene.add(habitatBase)
    this.habitatGlass = new THREE.MeshStandardMaterial({ color: '#6fdfed', roughness: 0.24, metalness: 0.16, transparent: true, opacity: 0.32, emissive: '#1ba4bc', emissiveIntensity: 0.28, side: THREE.DoubleSide })
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.95, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), this.habitatGlass)
    dome.position.set(-1.6, 0.38, 0.2)
    this.scene.add(dome)
    this.addDomeRibs(-1.6, 0.39, 0.2, 1.96, '#9cf6ff')
    const habitatLight = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), new THREE.MeshBasicMaterial({ color: '#95f5ff' }))
    habitatLight.position.set(-1.4, 1.06, 0.15)
    this.scene.add(habitatLight)
    this.addCylinder(-1.7, 0.72, 0.28, 0.16, '#92c2d0', 0.1, 0.48)
    this.addLabel('HABITAT A', -1.6, 3.6, 0.2, '#b6f9ff')

    const labBase = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.3, 0.2, 36), material('#525a70', 0.5, { metalness: 0.38 }))
    labBase.position.set(4.0, 0.11, -2.3)
    this.scene.add(labBase)
    const labGlass = new THREE.Mesh(new THREE.SphereGeometry(1.23, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#b596ff', transparent: true, opacity: 0.34, emissive: '#664cc2', emissiveIntensity: 0.17, side: THREE.DoubleSide, roughness: 0.3 }))
    labGlass.position.set(4.0, 0.2, -2.3)
    this.scene.add(labGlass)
    this.addDomeRibs(4, 0.22, -2.3, 1.24, '#d5c4ff')
    this.addLabel('RESEARCH DOME', 4, 2.25, -2.3, '#d6c8ff')

    // Communication tower and rotating beacon.
    this.addCylinder(5.7, 0.8, 0.14, 1.5, '#8da8b4', 0.09, 0.58)
    this.addCylinder(5.7, 1.72, 0.52, 0.12, '#71889a', 0.1, 0.6)
    const mastArm = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.075, 0.075), material('#a4b7c0', 0.4, { metalness: 0.65 }))
    mastArm.position.set(5.7, 2.25, -0.03)
    this.scene.add(mastArm)
    this.signal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: '#6af5ff' }))
    this.signal.position.set(5.7, 2.48, -0.03)
    this.scene.add(this.signal)
    this.signalHalo = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 8, 40), new THREE.MeshBasicMaterial({ color: '#65eaff', transparent: true, opacity: 0.82 }))
    this.signalHalo.position.copy(this.signal.position)
    this.signalHalo.rotation.x = Math.PI / 2
    this.scene.add(this.signalHalo)
    this.addLabel('COMMS TOWER', 5.7, 3.08, -0.03, '#92f1ff')

    this.panels = material('#12556a', 0.38, { metalness: 0.62, emissive: '#073a50', emissiveIntensity: 0.55 })
    this.addSolarArray(-6.5, 0.35, -1.5, -0.24)
    this.addSolarArray(-6.0, 0.35, 3.2, 0.15)
    this.addLabel('SOLAR ARRAY', -6.2, 2.3, -1.7, '#ffe19b')

    this.rover = this.makeRover()
    this.rover.position.set(3.2, 0.27, 4.1)
    this.scene.add(this.rover)
    this.addLabel('ROVER 02', 3.2, 1.55, 4.1, '#f4d391')

    const routePoints = [new THREE.Vector3(-1, 0.035, 2.2), new THREE.Vector3(0.9, 0.04, 3.4), new THREE.Vector3(3.2, 0.04, 4.1), new THREE.Vector3(4.4, 0.04, 2), new THREE.Vector3(4, 0.04, -0.9)]
    const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(routePoints).getPoints(48)), new THREE.LineDashedMaterial({ color: '#67e9ef', dashSize: 0.27, gapSize: 0.18, transparent: true, opacity: 0.86 }))
    route.computeLineDistances()
    this.scene.add(route)
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 10), new THREE.MeshBasicMaterial({ color: '#7cf5ff', transparent: true, opacity: 0.14 }))
    beacon.position.set(3.2, 1.2, 4.1)
    this.scene.add(beacon)

    this.dust = this.makeStars()
    this.scene.add(this.dust)
    this.setMission(level, resources)
  }

  private addCylinder(x: number, y: number, radius: number, height: number, color: string, rTop = radius, roughness = 0.6): void {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, rTop, height, 18), material(color, roughness, { metalness: 0.38 }))
    mesh.position.set(x, y, 0)
    this.scene.add(mesh)
  }

  private addCrater(x: number, z: number, radius: number): void {
    const crater = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.16, 8, 36), material('#697386', 0.98))
    crater.rotation.x = Math.PI / 2
    crater.position.set(x, 0.035, z)
    crater.scale.z = 0.62
    this.scene.add(crater)
    const inner = new THREE.Mesh(new THREE.CircleGeometry(radius - 0.12, 32), material('#333d4d', 0.99))
    inner.rotation.x = -Math.PI / 2
    inner.position.set(x, 0.022, z)
    inner.scale.set(1, 0.62, 1)
    this.scene.add(inner)
  }

  private addRidge(): void {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 18; i += 1) points.push(new THREE.Vector3(-12 + i * 1.35, 0.02 + Math.sin(i * 0.6) * 0.24, -8.5 - Math.cos(i * 0.3) * 0.8))
    const ridge = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#a3b1c5', transparent: true, opacity: 0.22 }))
    this.scene.add(ridge)
  }

  private addDomeRibs(x: number, y: number, z: number, radius: number, color: string): void {
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
    for (let a = 0; a < 8; a += 1) {
      const angle = (Math.PI * 2 * a) / 8
      const points: THREE.Vector3[] = []
      for (let s = 0; s <= 16; s += 1) {
        const theta = (Math.PI / 2) * (s / 16)
        points.push(new THREE.Vector3(x + Math.sin(theta) * Math.cos(angle) * radius, y + Math.cos(theta) * radius, z + Math.sin(theta) * Math.sin(angle) * radius))
      }
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat))
    }
  }

  private addSolarArray(x: number, y: number, z: number, rotation: number): void {
    const group = new THREE.Group()
    group.position.set(x, y, z)
    group.rotation.y = rotation
    const legMat = material('#a1b7c1', 0.42, { metalness: 0.7 })
    for (const dx of [-1.5, 1.5]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.25, 8), legMat)
      leg.position.set(dx, 0.58, 0)
      group.add(leg)
    }
    for (let p = 0; p < 3; p += 1) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 1.65), this.panels)
      panel.position.set(p * 1.0 - 1, 1.26 + Math.sin(rotation) * 0.05, 0)
      panel.rotation.x = -0.3
      group.add(panel)
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry), new THREE.LineBasicMaterial({ color: '#67d5e8', transparent: true, opacity: 0.78 }))
      edge.position.copy(panel.position)
      edge.rotation.copy(panel.rotation)
      group.add(edge)
      for (let c = 0; c < 3; c += 1) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 1.48), new THREE.MeshBasicMaterial({ color: '#68cee1', transparent: true, opacity: 0.28 }))
        stripe.position.set(p * 1.0 - 1 + (c - 1) * 0.25, 1.31 + Math.sin(rotation) * 0.05, 0)
        stripe.rotation.x = -0.3
        group.add(stripe)
      }
    }
    this.scene.add(group)
  }

  private makeRover(): THREE.Group {
    const g = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.48, 0.78), material('#c99a4d', 0.45, { metalness: 0.36 }))
    body.position.y = 0.72
    g.add(body)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.31, 0.53), new THREE.MeshStandardMaterial({ color: '#92c9d7', metalness: 0.32, roughness: 0.22, transparent: true, opacity: 0.78 }))
    cabin.position.set(-0.06, 1.1, 0)
    g.add(cabin)
    const wheelMat = material('#202b39', 0.76, { metalness: 0.25 })
    for (const x of [-0.4, 0.4]) for (const z of [-0.47, 0.47]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 14), wheelMat)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, 0.36, z)
      g.add(wheel)
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.72, 8), material('#a8c5ce', 0.4))
    mast.position.set(0.35, 1.32, -0.12)
    g.add(mast)
    const cam = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: '#78f1ff' }))
    cam.position.set(0.35, 1.67, -0.12)
    g.add(cam)
    return g
  }

  private addLabel(text: string, x: number, y: number, z: number, color: string): void {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '600 34px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(4, 16, 29, .68)'
    ctx.beginPath()
    ctx.roundRect(42, 15, 428, 66, 22)
    ctx.fill()
    ctx.strokeStyle = `${color}66`
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fillText(text, 256, 49)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, sizeAttenuation: true }))
    sprite.scale.set(2.8, 0.53, 1)
    sprite.position.set(x, y, z)
    sprite.userData.dispose = () => { texture.dispose(); sprite.material.dispose() }
    this.scene.add(sprite)
  }

  private makeStars(): THREE.Points {
    const count = 380
    const values = new Float32Array(count * 3)
    let seed = 1083
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2
      const radius = 19 + random() * 21
      values[i * 3] = Math.cos(angle) * radius
      values[i * 3 + 1] = 2.2 + random() * 20
      values[i * 3 + 2] = Math.sin(angle) * radius - 10
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(values, 3))
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#c7edff', size: 0.11, transparent: true, opacity: 0.82, sizeAttenuation: true }))
    stars.userData.dispose = () => { geometry.dispose(); (stars.material as THREE.Material).dispose() }
    return stars
  }

  setMission(level: MissionLevel, resources: ResourceValues): void {
    const isMars = level.world === 'mars'
    const training = level.world === 'training'
    const surfaceColor = training ? '#434a5d' : isMars ? '#725044' : '#384353'
    ;(this.terrain.material as THREE.MeshStandardMaterial).color.set(surfaceColor)
    const groundMesh = this.scene.getObjectByName('ground') as THREE.Mesh | undefined
    ;(groundMesh?.material as THREE.MeshStandardMaterial | undefined)?.color.set(surfaceColor)
    this.scene.fog?.color.set(isMars ? '#2b1820' : '#0a1930')
    const background = this.scene.background
    if (background instanceof THREE.Color) background.set(isMars ? '#170f1a' : '#071425')
    this.scene.traverse(object => {
      const line = object as THREE.Line
      if (line.isLine && line.material instanceof THREE.LineDashedMaterial) line.material.color.set(isMars ? '#ffa77b' : '#67e9ef')
    })
    if (level.id === 1) { this.rover.position.set(3.2, 0.27, 3.1); this.spin = -0.1 }
    else if (level.id === 2) { this.rover.position.set(2.4, 0.27, 4.3); this.spin = 0.06 }
    else { this.rover.position.set(3.2, 0.27, 4.1); this.spin = 0 }
    this.setResources(resources)
  }

  setResources(resources: ResourceValues): void {
    const criticalPower = resources.power < 28
    this.panels.emissiveIntensity = criticalPower ? 0.1 : 0.55
    this.habitatGlass.emissiveIntensity = (resources.oxygen < 35 ? 0.06 : CONFIG.outpost.signalGlow)
    const tint = resources.oxygen < 25 ? '#ff7b70' : resources.power < 25 ? '#ffbd69' : '#6af5ff'
    ;(this.signal.material as THREE.MeshBasicMaterial).color.set(tint)
    ;(this.signalHalo.material as THREE.MeshBasicMaterial).color.set(tint)
  }

  setZoom(direction: -1 | 1): void { this.zoom = THREE.MathUtils.clamp(this.zoom - direction * CONFIG.outpost.zoomStep, 0.72, 1.35) }
  resetView(): void { this.zoom = 1; this.spin = 0 }

  update(dt: number): void {
    if (this.disposed) return
    this.clock += Math.min(dt, 0.05)
    const reduce = this.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches
    const orbit = reduce ? 0.44 + this.spin : 0.44 + this.spin + Math.sin(this.clock * CONFIG.outpost.orbitSpeed) * 0.026
    const distance = (23 * CONFIG.camera.distance) / (6.4 * this.zoom)
    const target = new THREE.Vector3(Math.sin(orbit) * distance * 0.68, 12.2 / this.zoom, Math.cos(orbit) * distance * 0.75)
    this.camera.position.lerp(target, 1 - Math.exp(-CONFIG.camera.follow * Math.min(dt, 0.05)))
    if (this.camera.fov !== CONFIG.camera.fov) this.camera.fov = CONFIG.camera.fov
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(0, 0.9, 0)
    if (!reduce) {
      const pulse = 0.9 + Math.sin(this.clock * 1.8) * 0.11
      this.signal.scale.setScalar(pulse)
      this.signalHalo.rotation.z += dt * 0.26
      this.signalHalo.scale.setScalar(0.9 + Math.sin(this.clock * 1.8) * 0.08)
      this.rover.rotation.y = Math.sin(this.clock * 0.17) * 0.07
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line || object instanceof THREE.Sprite)) return
      object.geometry?.dispose?.()
      const mats = Array.isArray(object.material) ? object.material : object.material ? [object.material] : []
      for (const mat of mats) {
        const texture = (mat as THREE.SpriteMaterial).map
        texture?.dispose?.()
        mat.dispose()
      }
      const customDispose = object.userData.dispose as (() => void) | undefined
      customDispose?.()
    })
  }
}
