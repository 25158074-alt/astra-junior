import type { Audio } from '../engine/audio'
import type { Renderer } from '../engine/renderer'
import type { I18n } from '../engine/i18n'
import type { SaveStore } from '../engine/save'
import { getLevel, LEVEL_TITLES, RESOURCE_META, SKILL_META, SYSTEM_OPTIONS, type MissionLevel, type ResourceKey, type SkillKey } from '../game/mission-data'
import { OutpostScene } from '../game/outpost-scene'
import { beginMission, clearProgress, confirmDecision, confirmKit, confirmLoadout, createFreshProgress, kitTotals, loadProgress, logRelativeTime, readinessScore, resetToFresh, resourceStatus, retryMission, saveProgress, selectDecision, toggleGear, toggleSupply, answerSystem, strongestSkill, weakestSkill, type MissionProgress } from '../game/mission-state'

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const clock = (seconds: number): string => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(Math.floor(seconds) % 60).padStart(2, '0')}`

export class MissionUI {
  readonly scene: OutpostScene
  private readonly root: HTMLElement
  private progress: MissionProgress
  private showAllLog = false
  private showQuizFeedback = false
  private mobileNavOpen = false
  private lastClockUpdate = 0

  constructor(canvas: HTMLCanvasElement, renderer: Renderer, private readonly settings: SaveStore, private readonly audio: Audio, private readonly i18n: I18n) {
    this.i18n.set('en')
    this.root = document.getElementById('ui')!
    this.progress = loadProgress()
    this.root.innerHTML = this.shell()
    this.root.querySelector('.scene-window')!.append(canvas)
    this.scene = new OutpostScene(renderer, canvas, getLevel(this.progress.currentLevel) ?? getLevel(1)!, this.progress.resources)
    this.scene.reducedMotion = this.settings.data.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches
    this.root.addEventListener('click', event => this.onClick(event))
    this.root.addEventListener('change', event => this.onChange(event))
    this.root.addEventListener('input', event => this.onInput(event))
    this.root.addEventListener('keydown', event => this.onKeyDown(event))
    this.render()
    if (this.progress.phase === 'welcome') this.root.querySelector<HTMLButtonElement>('[data-action="start-fresh"]')?.focus({ preventScroll: true })
  }

  update(dt: number): void {
    this.scene.update(dt)
    const now = performance.now()
    if (now - this.lastClockUpdate > 1000) {
      this.lastClockUpdate = now
      if (this.progress.phase === 'playing') this.root.querySelectorAll<HTMLElement>('[data-clock]').forEach(clockEl => { clockEl.textContent = this.missionClock() })
    }
  }

  dispose(): void { this.scene.dispose() }

  private shell(): string {
    return `<div class="astra-shell">
      <header class="topbar">
        <button class="brand" type="button" data-action="home" aria-label="ASTRA Junior home">
          <span class="brand-orbit" aria-hidden="true"><i></i><b></b></span><span><strong>ASTRA</strong><small>JUNIOR</small></span>
        </button>
        <div class="top-status"><span class="live-dot" aria-hidden="true"></span><span>MISSION CONTROL ONLINE</span><span class="status-divider"></span><span class="status-time" data-clock>03:48:12</span></div>
        <div class="top-actions">
          <button class="icon-button mobile-menu" type="button" data-action="mobile-menu" aria-label="Open training levels" aria-expanded="false">☰</button>
          <button class="icon-button" type="button" data-action="sound" aria-label="Toggle sound" aria-pressed="${!this.settings.data.muted}"><span aria-hidden="true">${this.settings.data.muted ? '♩̸' : '♫'}</span><span class="sr-only">Sound</span></button>
          <button class="icon-button motion-toggle" type="button" data-action="motion" aria-label="Toggle reduced motion" aria-pressed="${this.settings.data.reducedMotion}"><span aria-hidden="true">◌</span><span class="sr-only">Reduced motion</span></button>
          <button class="profile-pill" type="button" data-action="profile" aria-label="Open astronaut readiness profile"><span class="avatar-mark">AJ</span><span class="profile-copy"><b>${escapeHtml(this.progress.callSign)}</b><small>SPACE APPRENTICE</small></span><span aria-hidden="true">⌄</span></button>
        </div>
      </header>

      <div class="workspace">
        <nav class="training-rail ${this.mobileNavOpen ? 'is-open' : ''}" aria-label="Training program">
          <div class="rail-kicker">TRAINING PROGRAM</div>
          <div class="rank-card glass-card">
            <div class="rank-ring" style="--progress:${Math.round((this.progress.completedLevels.length / 10) * 100)}%"><span>R1</span></div>
            <div><b>SPACE APPRENTICE</b><span>${this.progress.completedLevels.length} of 10 missions complete</span></div>
          </div>
          <div class="level-heading"><span>MISSION SEQUENCE</span><span>${String(this.progress.unlockedThrough).padStart(2, '0')} / 10</span></div>
          <ol class="level-list" aria-label="Training levels">${this.levelNavigation()}</ol>
          <div class="rail-actions">
            <button class="quiet-button" type="button" data-action="help">ⓘ <span>How to play</span></button>
            <button class="quiet-button" type="button" data-action="reset">↺ <span>Reset training</span></button>
            <button class="quiet-button" type="button" data-action="credits">⌘ <span>Credits</span></button>
          </div>
          <div class="rail-note"><span class="note-orbit" aria-hidden="true">✦</span><span><b>MISSION NOTE</b><small>Every choice protects one system—and may challenge another.</small></span></div>
        </nav>

          <main class="mission-main" id="main-content" tabindex="-1">
          <div class="mission-heading">
            <div><div class="eyebrow">JUNIOR ASTRONAUT MISSION TRAINER</div><h1>${escapeHtml(this.activeLevel().title)}</h1><p>${escapeHtml(this.activeLevel().briefing)}</p></div>
            <div class="mission-stamps"><span class="location-chip"><span aria-hidden="true">⌖</span> ${escapeHtml(this.activeLevel().location)}</span><span class="clock-chip"><span class="live-dot" aria-hidden="true"></span><b data-clock>${this.missionClock()}</b><small>MISSION ELAPSED</small></span></div>
          </div>
          <section class="resource-grid" aria-label="Outpost resource telemetry">${this.resourcesMarkup()}</section>
          <section class="scene-section" aria-labelledby="scene-title">
            <div class="section-title-row"><div><span class="section-kicker">OUTPOST OVERVIEW</span><h2 id="scene-title">Polar ridge · Habitat A</h2></div><div class="scene-controls" aria-label="Outpost scene controls"><button type="button" class="scene-control" data-action="zoom-out" aria-label="Zoom out">−</button><button type="button" class="scene-control" data-action="zoom-in" aria-label="Zoom in">+</button><button type="button" class="scene-control reset-view" data-action="reset-view" aria-label="Reset outpost view">⌖ <span>Reset view</span></button></div></div>
            <div class="scene-window"><div class="scene-vignette" aria-hidden="true"></div><div class="scene-chip"><span class="signal-pulse" aria-hidden="true"></span><span>LIVE OUTPOST FEED</span></div><div class="scene-tooltip scene-label-habitat">HABITAT A <small>LIFE SUPPORT</small></div><div class="scene-tooltip scene-label-solar">SOLAR ARRAY <small>POWER GENERATION</small></div><div class="scene-tooltip scene-label-rover">ROVER 02 <small>SURFACE ROUTE</small></div><div class="scene-coordinates">POLAR RIDGE <span>·</span> 84.2° N</div><div class="scene-canvas-host" aria-hidden="true"></div></div>
            <div class="scene-legend"><span><i class="legend-life"></i>Life support stable</span><span><i class="legend-comms"></i>Communications active</span><span><i class="legend-low"></i>Power reserve monitored</span><span class="scene-context">${escapeHtml(this.activeLevel().visualContext)}</span></div>
          </section>

          <section class="activity-section" aria-labelledby="activity-title">
            <div class="activity-heading"><div><span class="section-kicker">TRAINING ACTIVITY · LEVEL ${String(this.activeLevel().id).padStart(2, '0')}</span><h2 id="activity-title">${escapeHtml(this.activityHeading())}</h2><p>${escapeHtml(this.activeLevel().objective)}</p></div><span class="activity-count">${this.activityProgress()}</span></div>
            <div class="activity-content">${this.activityMarkup()}</div>
            <div class="feedback-strip" role="status" aria-live="polite"><span class="feedback-icon" aria-hidden="true">${this.progress.phase === 'outcome' ? '✓' : 'i'}</span><span>${escapeHtml(this.progress.statusMessage)}</span></div>
          </section>

          <div class="lower-panels">
            <section class="panel mission-log-panel" aria-labelledby="log-title"><div class="panel-heading"><div><span class="section-kicker">MISSION MEMORY</span><h2 id="log-title">Mission log</h2></div><div class="panel-actions"><button class="text-button" type="button" data-action="toggle-log">${this.showAllLog ? 'Recent' : 'View all'}</button><button class="text-button" type="button" data-action="clear-log">Clear</button></div></div><ol class="log-list">${this.logMarkup()}</ol></section>
            <section class="panel readiness-panel" aria-labelledby="readiness-title"><div class="panel-heading"><div><span class="section-kicker">ASTRONAUT PROFILE</span><h2 id="readiness-title">Mission readiness</h2></div><span class="readiness-score"><b>${readinessScore(this.progress.skills)}</b><small>/100</small></span></div><p class="readiness-note">Readiness is more than survival: it reflects your reasoning, planning, and safe teamwork too.</p><div class="readiness-visual">${this.radarMarkup()}<div class="radar-copy"><b>8 SKILL AREAS</b><small>A high score reflects safe choices, planning, teamwork, and reasoning—not survival alone.</small></div></div><div class="skill-list">${this.skillsMarkup()}</div><button class="text-button profile-link" type="button" data-action="profile">View full profile <span aria-hidden="true">↗</span></button></section>
          </div>
          <footer class="main-footer"><span>ASTRA JUNIOR <i>·</i> LEARN BY DECIDING</span><span>Training simulation · Not a real spacecraft control system</span></footer>
        </main>

        <aside class="mission-aside" aria-label="Current mission brief">
          <section class="objective-card glass-card"><div class="aside-top"><span class="section-kicker">CURRENT OBJECTIVE</span><span class="level-number">${String(this.activeLevel().id).padStart(2, '0')}</span></div><span class="objective-badge">${escapeHtml(this.activeLevel().badgeMark)} ${escapeHtml(this.activeLevel().badge)}</span><h2>${escapeHtml(this.activeLevel().shortTitle)}</h2><p>${escapeHtml(this.activeLevel().objective)}</p><div class="objective-risk"><span class="risk-icon" aria-hidden="true">!</span><span><b>MAIN RISK</b><small>${escapeHtml(this.activeLevel().risk)}</small></span></div><div class="objective-checklist"><b>MISSION CHECKLIST</b>${this.checklistMarkup()}</div><div class="control-message"><span class="control-avatar">MC</span><span><b>MISSION CONTROL</b><small>${escapeHtml(this.activeLevel().missionControl)}</small></span></div><button class="primary-button report-button" type="button" data-action="report">OPEN MISSION REPORT <span aria-hidden="true">↗</span></button></section>
            <section class="panel field-panel"><div class="panel-heading"><div><span class="section-kicker">LIVE EVENT</span><h2>Situation update</h2></div><span class="event-icon" aria-hidden="true">⌁</span></div><p>${escapeHtml(this.activeLevel().event)}</p><div class="event-status"><span class="live-dot" aria-hidden="true"></span>${this.eventStatus()}</div></section>
            <section class="panel field-panel crew-card"><div class="panel-heading"><div><span class="section-kicker">CREW STATUS</span><h2>Team Aurora</h2></div><span class="crew-count">03</span></div><div class="crew-row"><span class="crew-avatar crew-one">AR</span><span><b>Alex Rivera</b><small>Mission specialist · rested</small></span><span class="crew-health">${Math.round(this.progress.resources.health)}%</span></div><div class="crew-row"><span class="crew-avatar crew-two">MK</span><span><b>Mina Kim</b><small>Life-support engineer</small></span><span class="crew-health">READY</span></div><div class="crew-row"><span class="crew-avatar crew-three">JT</span><span><b>Jules Tan</b><small>Science officer</small></span><span class="crew-health">READY</span></div></section>
            <section class="badge-card"><span class="badge-star" aria-hidden="true">✧</span><div><b>${this.progress.badges.length ? `${this.progress.badges.length} BADGE${this.progress.badges.length === 1 ? '' : 'S'} EARNED` : 'BADGE AWAITS'}</b><small>${this.progress.badges.length ? escapeHtml(this.progress.badges[this.progress.badges.length - 1]) : `Complete Level ${this.activeLevel().id} to earn ${escapeHtml(this.activeLevel().badge)}.`}</small></div></section>
          </aside>
      </div>

      <div class="welcome-overlay ${this.progress.phase === 'welcome' ? 'is-visible' : ''}" ${this.progress.phase === 'welcome' ? '' : 'hidden'}>
        <section class="welcome-card glass-card" role="dialog" aria-modal="true" aria-labelledby="welcome-title"><div class="welcome-mark" aria-hidden="true"><span>✦</span><i></i><b></b></div><div class="eyebrow">ASTRA JUNIOR · MISSION TRAINER</div><h2 id="welcome-title">Become<br><em>mission-ready.</em></h2><p>Make a hard choice. See the outpost react. Explain your thinking. Every mission makes you a sharper astronaut.</p><div class="welcome-facts"><span><b>10</b><small>MISSION LEVELS</small></span><span><b>8</b><small>ASTRONAUT SKILLS</small></span><span><b>∞</b><small>WAYS TO LEARN</small></span></div><button class="primary-button welcome-start" type="button" data-action="start-fresh">START TRAINING <span aria-hidden="true">→</span></button><button class="secondary-button" type="button" data-action="continue-demo">CONTINUE SAMPLE PROFILE · 2/10</button><small class="welcome-disclaimer">For learning and exploration. No prior space knowledge needed.</small></section>
      </div>

      <dialog class="astra-dialog" id="help-dialog" aria-labelledby="help-title"><button class="dialog-close" type="button" data-close aria-label="Close help">×</button><span class="section-kicker">FLIGHT SCHOOL</span><h2 id="help-title">How to play</h2><ol class="help-steps"><li><b>Read the briefing.</b><span>Mission Control tells you what the crew needs and what could go wrong.</span></li><li><b>Prepare or choose.</b><span>Match a system, pack your suit, or balance the kit limit.</span></li><li><b>Watch the trade-off.</b><span>Each choice has a benefit, a cost, and may change a later mission.</span></li><li><b>Explain your thinking.</b><span>Good astronauts share why safety, science, or resources mattered.</span></li><li><b>Review and retry.</b><span>Your mission memory shows what changed and what to practice next.</span></li></ol><p class="dialog-callout">Every space-mission decision solves one problem while possibly creating another.</p><button class="primary-button" type="button" data-close>GOT IT</button></dialog>
      <dialog class="astra-dialog report-dialog" id="report-dialog" aria-labelledby="report-title"></dialog>
      <dialog class="astra-dialog" id="reset-dialog" aria-labelledby="reset-title"><button class="dialog-close" type="button" data-close aria-label="Close reset dialog">×</button><span class="section-kicker">TRAINING RECORD</span><h2 id="reset-title">Reset training?</h2><p>This clears ASTRA Junior progress, mission choices, and badges saved in this browser. Your browser settings and other data are unchanged.</p><div class="dialog-actions"><button class="secondary-button" type="button" data-close>KEEP PROGRESS</button><button class="danger-button" type="button" data-action="confirm-reset">RESET TRAINING</button></div></dialog>
      <dialog class="astra-dialog" id="credits-dialog" aria-labelledby="credits-title"><button class="dialog-close" type="button" data-close aria-label="Close credits">×</button><span class="section-kicker">PROJECT CREDITS</span><h2 id="credits-title">Made for curious minds</h2><p>ASTRA Junior is an original educational simulation created to practice systems thinking, safe planning, resource choices, and teamwork.</p><ul><li>Outpost scene and interface: original procedural work.</li><li>Typography: system UI font stack with platform fallbacks.</li><li>3D engine: Three.js (MIT); Rapier 3D remains in the supplied starter (Apache-2.0).</li><li>Challenge: “Build a Junior Astronaut Mission Trainer,” based on the user-supplied 2026 NASA Space Apps Challenge brief. ASTRA Junior is not a NASA product or endorsement.</li><li>AI assistance: code and authored draft content were prepared with AI assistance; review and adapt before formal submission.</li></ul><p class="credits-small">No external mission-control screenshots, branded characters, or generated scene assets are used.</p></dialog>
      <div class="sr-only" aria-live="polite" data-announcer></div>
    </div>`
  }

  private activeLevel(): MissionLevel { return getLevel(this.progress.currentLevel) ?? getLevel(1)! }

  private levelNavigation(): string {
    return LEVEL_TITLES.map(level => {
      const available = level.id <= this.progress.unlockedThrough && !!getLevel(level.id)
      const complete = this.progress.completedLevels.includes(level.id)
      const active = this.progress.currentLevel === level.id
      const icon = complete ? '✓' : available ? String(level.id).padStart(2, '0') : '⌑'
      const state = complete ? 'Complete' : available ? active ? 'Current mission' : 'Unlocked' : 'Mission locked'
      return `<li><button class="level-button ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''} ${available ? '' : 'is-locked'}" type="button" data-level="${level.id}" ${available ? '' : 'disabled'} aria-current="${active ? 'step' : 'false'}" aria-label="Level ${level.id}: ${escapeHtml(level.title)} — ${state}"><span class="level-icon" aria-hidden="true">${icon}</span><span class="level-copy"><b>${escapeHtml(level.title)}</b><small>${complete ? 'COMPLETED' : available ? active ? 'CURRENT MISSION' : 'READY TO LAUNCH' : 'COMPLETE PREVIOUS LEVEL'}</small></span>${active ? '<span class="active-rail" aria-hidden="true"></span>' : ''}</button></li>`
    }).join('')
  }

  private resourcesMarkup(): string {
    const order: ResourceKey[] = ['oxygen', 'water', 'power', 'food', 'health', 'materials']
    return order.map((key, index) => {
      const meta = RESOURCE_META[key]
      const value = Math.round(this.progress.resources[key])
      const status = resourceStatus(value)
      const delta = this.progress.resources[key] - this.progress.initialResources[key]
      const trend = delta > 0 ? `↑ ${Math.abs(Math.round(delta))}%` : delta < 0 ? `↓ ${Math.abs(Math.round(delta))}%` : '—'
      return `<article class="resource-card ${index === 5 ? 'resource-secondary' : ''}" data-resource="${key}"><div class="resource-top"><span class="resource-icon ${meta.color}" aria-hidden="true">${meta.icon}</span><span class="resource-trend ${delta < 0 ? 'trend-down' : delta > 0 ? 'trend-up' : ''}" aria-label="Change from mission start: ${escapeHtml(trend)}">${trend}</span></div><div class="resource-name">${meta.label}${index === 5 ? '<span class="secondary-tag">SUPPLY</span>' : ''}</div><div class="resource-value">${value}<small>%</small></div><div class="meter" role="progressbar" aria-label="${meta.label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-valuetext="${value} percent, ${status.label}"><span class="meter-fill ${meta.color}" style="--value:${value}%"></span></div><div class="resource-status"><span class="status-symbol ${status.tone}" aria-hidden="true">${status.label === 'Stable' ? '✓' : status.label === 'Warning' ? '!' : '×'}</span><span>${status.label}</span><small>${meta.description}</small></div></article>`
    }).join('')
  }

  private activityHeading(): string {
    const level = this.activeLevel()
    if (this.progress.phase === 'outcome') return this.progress.latestOutcome?.passed ? 'Mission memory updated' : 'Practice makes mission-ready'
    if (level.mode === 'systems') return 'Match the outpost system'
    if (level.mode === 'spacesuit') return 'Build your EVA suit loadout'
    if (level.mode === 'kit') return 'Pack a resilient mission kit'
    return 'What will you prioritize?'
  }
  private activityProgress(): string {
    const level = this.activeLevel()
    if (this.progress.phase === 'outcome') return this.progress.latestOutcome?.passed ? 'MISSION COMPLETE' : 'RETRY AVAILABLE'
    if (level.mode === 'systems') { const total = level.systemScenarios?.length ?? 0; return `${Math.min(this.progress.quizIndex + (this.showQuizFeedback ? 0 : 1), total)} / ${total} SYSTEM CHECKS` }
    if (level.mode === 'spacesuit') return `${this.progress.loadout.length} / ${level.equipmentSlots} SLOTS`
    if (level.mode === 'kit') return `${this.progress.kitItems.length} SUPPLIES`
    return 'DECISION PHASE'
  }

  private activityMarkup(): string {
    const level = this.activeLevel()
    if (this.progress.phase === 'outcome') return this.outcomeMarkup()
    if (level.mode === 'systems') return this.systemActivity(level)
    if (level.mode === 'spacesuit') return this.suitActivity(level)
    if (level.mode === 'kit') return this.kitActivity(level)
    return this.decisionActivity(level)
  }

  private systemActivity(level: MissionLevel): string {
    const scenarios = level.systemScenarios ?? []
    if (this.showQuizFeedback && this.progress.quizAnswers.length) {
      const result = this.progress.quizAnswers[this.progress.quizAnswers.length - 1]
      const scenario = scenarios.find(s => s.id === result.scenarioId)
      return `<div class="quiz-feedback ${result.correct ? 'is-correct' : 'is-review'}"><span class="quiz-feedback-mark" aria-hidden="true">${result.correct ? '✓' : '↗'}</span><div><b>${result.correct ? 'System matched' : 'Clue reviewed'}</b><p>${escapeHtml(scenario?.explanation ?? this.progress.statusMessage)}</p></div><button class="primary-button compact-button" type="button" data-action="next-quiz">NEXT CLUE <span aria-hidden="true">→</span></button></div>`
    }
    const scenario = scenarios[this.progress.quizIndex]
    if (!scenario) return `<p class="stage-placeholder">All system clues have been reviewed.</p>`
    return `<div class="scenario-card"><div class="scenario-count"><span>PROBLEM ${this.progress.quizIndex + 1} <i>/</i> ${scenarios.length}</span><div class="quiz-dots" aria-label="${this.progress.quizIndex} of ${scenarios.length} clues answered">${scenarios.map((_, i) => `<i class="${i < this.progress.quizIndex ? this.progress.quizAnswers[i]?.correct ? 'is-done' : 'is-review' : i === this.progress.quizIndex ? 'is-current' : ''}"></i>`).join('')}</div></div><div class="scenario-main"><span class="scenario-icon" aria-hidden="true">${scenario.icon}</span><p>${escapeHtml(scenario.prompt)}</p></div><div class="answer-prompt">WHICH SYSTEM SHOULD THE CREW CHECK?</div><div class="system-choice-grid">${SYSTEM_OPTIONS.map(option => `<button class="system-choice" type="button" data-system="${option.id}" aria-label="Choose ${escapeHtml(option.label)}"><span aria-hidden="true">${option.icon}</span><b>${escapeHtml(option.label)}</b><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div>`
  }

  private decisionExplanation(id: string, question: string, chain: string): string {
    return `<div class="decision-reason"><div class="reason-chain"><span class="section-kicker">CAUSE → EFFECT</span><p>${escapeHtml(chain)}</p></div><label for="${id}" class="reason-label">EXPLAIN YOUR DECISION</label><textarea id="${id}" data-explanation maxlength="160" rows="2" aria-describedby="${id}-hint" placeholder="${escapeHtml(question)}">${escapeHtml(this.progress.explanationDraft)}</textarea><div class="reason-foot"><small id="${id}-hint">At least 8 characters · Your reason is saved with this mission.</small><output>${this.progress.explanationDraft.length}/160</output></div></div>`
  }

  private suitActivity(level: MissionLevel): string {
    const items = level.gearItems ?? []
    const required = level.essentialGear ?? []
    const optional = this.progress.loadout.filter(id => !required.includes(id))
    const optionalName = items.find(item => item.id === optional[0])?.name ?? 'an optional equipment item'
    const chain = `Four safety essentials → air, radiation, temperature, and crew-link protection → EVA spends 4% oxygen and 3% power → ${optionalName} ${optional.length ? 'adds a special capability but fills the final equipment slot' : 'can add science, repair, or backup power in the final slot'}.`
    return `<div class="prep-budget"><div><span>SUIT EQUIPMENT</span><b>${this.progress.loadout.length} <small>/ ${level.equipmentSlots} slots used</small></b></div><div class="budget-track" role="progressbar" aria-label="Spacesuit equipment slots" aria-valuemin="0" aria-valuemax="${level.equipmentSlots}" aria-valuenow="${this.progress.loadout.length}"><i style="--value:${(this.progress.loadout.length / (level.equipmentSlots ?? 5)) * 100}%"></i></div><p>Essential: ${required.length} items · Choose exactly ${level.equipmentSlots} items.</p></div><div class="prep-grid gear-grid">${items.map(item => { const selected = this.progress.loadout.includes(item.id); return `<button type="button" class="prep-card ${selected ? 'is-selected' : ''}" data-gear="${item.id}" aria-pressed="${selected}"><span class="prep-card-top"><span class="prep-item-icon" aria-hidden="true">${item.icon}</span><span class="selected-check" aria-hidden="true">${selected ? '✓' : '+'}</span></span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.description)}</small><span class="prep-tradeoff"><strong>${item.essential ? 'ESSENTIAL' : 'OPTIONAL'}</strong> · ${escapeHtml(item.benefit)}</span><span class="prep-cost">TRADE-OFF · ${escapeHtml(item.tradeoff)}</span></button>` }).join('')}</div>${this.decisionExplanation('suit-explanation', 'I protected the crew by… The trade-off is…', chain)}<div class="activity-actions"><span class="action-hint">Five slots only. Safety equipment is checked before launch.</span><button class="primary-button" type="button" data-action="confirm-loadout">RUN SUIT CHECK <span aria-hidden="true">→</span></button></div>`
  }

  private kitActivity(level: MissionLevel): string {
    const items = level.supplies ?? []
    const totals = kitTotals(items, this.progress.kitItems)
    const massLimit = level.massLimitKg ?? 28
    const storageLimit = level.storageLimit ?? 16
    const massPct = Math.min(100, (totals.massKg / massLimit) * 100)
    const storePct = Math.min(100, (totals.storage / storageLimit) * 100)
    const chosen = items.filter(item => this.progress.kitItems.includes(item.id)).map(item => item.name)
    const chain = `${chosen.length ? chosen.join(' + ') : 'Your cargo choices'} → crew needs and repair capacity → mass and storage decrease → reserve supplies or science tools compete for the remaining room.`
    return `<div class="kit-budgets"><div class="budget-card"><div><span>MASS LIMIT</span><b>${totals.massKg}<small> / ${massLimit} kg</small></b></div><div class="budget-track" role="progressbar" aria-label="Kit mass" aria-valuemin="0" aria-valuemax="${massLimit}" aria-valuenow="${totals.massKg}"><i style="--value:${massPct}%"></i></div></div><div class="budget-card"><div><span>STORAGE LIMIT</span><b>${totals.storage}<small> / ${storageLimit} units</small></b></div><div class="budget-track budget-violet" role="progressbar" aria-label="Kit storage" aria-valuemin="0" aria-valuemax="${storageLimit}" aria-valuenow="${totals.storage}"><i style="--value:${storePct}%"></i></div></div></div><div class="kit-requirement"><span aria-hidden="true">⌑</span><span>Mission needs food, water, medical supplies, repair tools, and at least one backup: batteries or spare filters.</span></div><div class="prep-grid kit-grid">${items.map(item => { const selected = this.progress.kitItems.includes(item.id); return `<button type="button" class="prep-card supply-card ${selected ? 'is-selected' : ''}" data-supply="${item.id}" aria-pressed="${selected}"><span class="prep-card-top"><span class="prep-item-icon" aria-hidden="true">${item.icon}</span><span class="selected-check" aria-hidden="true">${selected ? '✓' : '+'}</span></span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.description)}</small><span class="supply-meta">${item.weightKg} kg <i>·</i> ${item.storageUnits} units</span><span class="prep-tradeoff"><strong>${item.essential ? 'ESSENTIAL' : escapeHtml(item.category.toUpperCase())}</strong></span></button>` }).join('')}</div>${this.decisionExplanation('kit-explanation', 'I prioritized… I left out… because…', chain)}<div class="activity-actions"><span class="action-hint">A backup protects the crew if a system fails.</span><button class="primary-button" type="button" data-action="confirm-kit">SECURE THE KIT <span aria-hidden="true">→</span></button></div>`
  }

  private decisionActivity(level: MissionLevel): string {
    const actions = level.actions ?? []
    const selected = actions.find(action => action.id === this.progress.selectedActionId)
    const cards = actions.map(action => `<button type="button" class="decision-card ${selected?.id === action.id ? 'is-selected' : ''}" data-decision="${escapeHtml(action.id)}" aria-pressed="${selected?.id === action.id}"><span class="decision-card-top"><span class="decision-risk risk-${action.risk}">${action.risk.toUpperCase()} RISK</span><span aria-hidden="true">${selected?.id === action.id ? '✓' : '↗'}</span></span><b>${escapeHtml(action.title)}</b><p>${escapeHtml(action.description)}</p><span class="decision-benefit"><strong>BENEFIT</strong> · ${escapeHtml(action.benefit)}</span><span class="decision-cost"><strong>COST</strong> · ${escapeHtml(action.cost)}</span><span class="decision-delay"><strong>DELAYED RISK</strong> · ${escapeHtml(action.delayedRisk)}</span></button>`).join('')
    const chain = selected ? selected.causeChain.join(' → ') : 'Choose a priority to reveal its immediate benefit, cost, and delayed consequence.'
    return `<div class="decision-intro"><span class="section-kicker">COMMAND CHOICE</span><p>Every option solves one problem while changing another. Select a card, inspect the trade-off, and explain your reasoning.</p></div><div class="decision-grid">${cards}</div>${selected ? `${this.decisionExplanation('decision-explanation', 'I chose this priority because… The risk I accepted is…', chain)}<div class="decision-selected"><span><b>SELECTED PRIORITY</b><small>${escapeHtml(selected.title)} · ${escapeHtml(selected.outcome)}</small></span><button class="primary-button" type="button" data-action="confirm-decision">CONFIRM COMMAND <span aria-hidden="true">→</span></button></div>` : '<p class="action-hint decision-hint">Select one decision card to continue.</p>'}`
  }

  private outcomeMarkup(): string {
    const outcome = this.progress.latestOutcome
    if (!outcome) return `<p class="stage-placeholder">Your mission review will appear here.</p>`
    return `<div class="outcome-card ${outcome.passed ? 'outcome-pass' : 'outcome-retry'}"><div class="outcome-badge" aria-hidden="true">${outcome.passed ? '✦' : '↺'}</div><div><span class="section-kicker">${outcome.passed ? 'MISSION BADGE' : 'RECOVERY WINDOW'}</span><h3>${escapeHtml(outcome.title)}</h3><p>${escapeHtml(outcome.summary)}</p><div class="outcome-summary"><span><small>READINESS</small><b>${outcome.readiness}<i>/100</i></b></span><span><small>STRONGEST SKILL</small><b>${escapeHtml(SKILL_META[outcome.strongestSkill].short)}</b></span><span><small>NEXT TRAINING</small><b>${escapeHtml(outcome.nextTraining)}</b></span></div></div></div><div class="activity-actions outcome-actions"><button class="secondary-button" type="button" data-action="retry">↻ RETRY LEVEL</button>${outcome.passed && this.progress.unlockedThrough > this.progress.currentLevel && getLevel(this.progress.currentLevel + 1) ? `<button class="primary-button" type="button" data-action="continue">CONTINUE TRAINING <span aria-hidden="true">→</span></button>` : ''}</div>`
  }

  private checklistMarkup(): string {
    const level = this.activeLevel()
    if (this.progress.phase === 'outcome') return `<span class="check-row is-done"><i>✓</i><small>${this.progress.latestOutcome?.passed ? 'Mission objective complete' : 'Try a new approach'}</small></span><span class="check-row ${this.progress.latestOutcome?.passed ? 'is-done' : ''}"><i>${this.progress.latestOutcome?.passed ? '✓' : '·'}</i><small>${this.progress.latestOutcome?.passed ? `Badge earned: ${escapeHtml(level.badge)}` : 'Retry available'}</small></span>`
    if (level.mode === 'systems') return `<span class="check-row ${this.progress.quizIndex ? 'is-done' : 'is-current'}"><i>${this.progress.quizIndex ? '✓' : '01'}</i><small>Match five system clues</small></span><span class="check-row ${this.progress.quizIndex >= 5 ? 'is-done' : ''}"><i>${this.progress.quizIndex >= 5 ? '✓' : '02'}</i><small>Get 4 of 5 correct</small></span><span class="check-row"><i>03</i><small>Earn Systems Spotter badge</small></span>`
    if (level.mode === 'spacesuit') return `<span class="check-row ${this.progress.loadout.length ? 'is-current' : ''}"><i>${this.progress.loadout.length ? '↗' : '01'}</i><small>Select ${level.equipmentSlots} suit items</small></span><span class="check-row"><i>02</i><small>Pack all four safety essentials</small></span><span class="check-row"><i>03</i><small>Return safely with the crew link</small></span>`
    if (level.mode === 'decisions') return `<span class="check-row ${this.progress.selectedActionId ? 'is-done' : 'is-current'}"><i>${this.progress.selectedActionId ? '✓' : '01'}</i><small>Choose a priority and inspect its trade-off</small></span><span class="check-row ${this.progress.explanationDraft.length >= 8 ? 'is-done' : ''}"><i>${this.progress.explanationDraft.length >= 8 ? '✓' : '02'}</i><small>Explain your decision and risk</small></span><span class="check-row"><i>03</i><small>Protect the crew and earn ${escapeHtml(level.badge)}</small></span>`
    return `<span class="check-row ${this.progress.kitItems.length ? 'is-current' : ''}"><i>${this.progress.kitItems.length ? '↗' : '01'}</i><small>Stay under ${level.massLimitKg} kg</small></span><span class="check-row"><i>02</i><small>Stay within ${level.storageLimit} units</small></span><span class="check-row"><i>03</i><small>Pack an emergency backup</small></span>`
  }

  private logMarkup(): string {
    const entries = [...this.progress.missionLog].reverse()
    const visible = this.showAllLog ? entries : entries.slice(0, 4)
    if (!visible.length) return '<li class="log-empty">No mission decisions yet. Your first choice will be recorded here.</li>'
    return visible.map(item => `<li class="log-entry log-${item.kind}"><span class="log-mark" aria-hidden="true">${item.kind === 'success' ? '✓' : item.kind === 'warning' ? '!' : '·'}</span><time>${logRelativeTime(item.time)}</time><span class="log-copy"><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.detail)}</small></span></li>`).join('')
  }

  private skillsMarkup(): string {
    const keys: SkillKey[] = ['safety', 'resourceManagement', 'planning', 'science', 'emergencyResponse', 'teamwork', 'sustainability', 'explanation']
    return keys.map((key, index) => `<div class="skill-row"><span class="skill-symbol skill-symbol-${index}" aria-hidden="true">${SKILL_META[key].icon}</span><span class="skill-name">${SKILL_META[key].short}</span><span class="skill-track" role="progressbar" aria-label="${SKILL_META[key].label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(this.progress.skills[key])}"><i style="--value:${Math.round(this.progress.skills[key])}%"></i></span><b>${Math.round(this.progress.skills[key])}</b></div>`).join('')
  }

  private radarMarkup(): string {
    const keys: SkillKey[] = ['safety', 'resourceManagement', 'planning', 'science', 'emergencyResponse', 'teamwork', 'sustainability', 'explanation']
    const point = (radius: number, index: number): string => {
      const angle = (index / keys.length) * Math.PI * 2 - Math.PI / 2
      return `${(80 + Math.cos(angle) * radius).toFixed(1)},${(80 + Math.sin(angle) * radius).toFixed(1)}`
    }
    const grid = [1, .75, .5, .25].map(scale => `<polygon class="radar-grid" points="${keys.map((_, i) => point(59 * scale, i)).join(' ')}"/>`).join('')
    const spokes = keys.map((_, i) => { const [x, y] = point(59, i).split(','); return `<line class="radar-spoke" x1="80" y1="80" x2="${x}" y2="${y}"/>` }).join('')
    const values = keys.map((key, i) => point(59 * this.progress.skills[key] / 100, i)).join(' ')
    const description = keys.map(key => `${SKILL_META[key].label} ${Math.round(this.progress.skills[key])} percent`).join(', ')
    return `<svg class="skill-radar" viewBox="0 0 160 160" role="img" aria-label="Astronaut skill radar: ${description}"><circle class="radar-core" cx="80" cy="80" r="2"/>${grid}${spokes}<polygon class="radar-profile" points="${values}"/></svg>`
  }

  private missionClock(): string {
    const elapsed = this.progress.phase === 'playing' ? Math.max(this.progress.elapsedSeconds, Math.floor((Date.now() - this.progress.startedAt) / 1000)) : this.progress.elapsedSeconds
    return clock(elapsed)
  }
  private eventStatus(): string {
    const statuses = [this.progress.resources.oxygen, this.progress.resources.water, this.progress.resources.power, this.progress.resources.health].map(resourceStatus)
    const critical = statuses.some(status => status.label === 'Critical')
    const warning = statuses.some(status => status.label === 'Warning')
    return critical ? 'CRITICAL SYSTEM · REVIEW REQUIRED' : warning ? 'WARNING · WATCH RESERVES' : 'STABLE · ALL SYSTEMS TRACKED'
  }

  private render(): void {
    const level = this.activeLevel()
    this.root.querySelector('.training-rail')?.classList.toggle('is-open', this.mobileNavOpen)
    const menu = this.root.querySelector<HTMLButtonElement>('[data-action="mobile-menu"]')
    menu?.setAttribute('aria-expanded', String(this.mobileNavOpen))
    const rankRing = this.root.querySelector<HTMLElement>('.rank-ring')
    rankRing?.style.setProperty('--progress', `${Math.round((this.progress.completedLevels.length / 10) * 100)}%`)
    const count = this.root.querySelector<HTMLElement>('.rank-card span:not(.rank-ring span)')
    if (count) count.textContent = `${this.progress.completedLevels.length} of 10 missions complete`
    const sequence = this.root.querySelector<HTMLElement>('.level-heading span:last-child')
    if (sequence) sequence.textContent = `${String(this.progress.unlockedThrough).padStart(2, '0')} / 10`
    const levelList = this.root.querySelector<HTMLOListElement>('.level-list')
    if (levelList) levelList.innerHTML = this.levelNavigation()
    this.root.querySelector<HTMLElement>('.profile-copy b')!.textContent = this.progress.callSign
    this.root.querySelector<HTMLElement>('.mission-heading h1')!.textContent = level.title
    this.root.querySelector<HTMLElement>('.mission-heading p')!.textContent = level.briefing
    this.root.querySelector<HTMLElement>('.location-chip')!.innerHTML = `<span aria-hidden="true">⌖</span> ${escapeHtml(level.location)}`
    this.root.querySelector<HTMLElement>('.section-title-row h2')!.textContent = level.world === 'mars' ? 'Ares field · Habitat A' : level.world === 'training' ? 'Training zone · Habitat A' : 'Polar ridge · Habitat A'
    this.root.querySelector<HTMLElement>('.scene-context')!.textContent = level.visualContext
    this.root.querySelector<HTMLElement>('.activity-heading .section-kicker')!.textContent = `TRAINING ACTIVITY · LEVEL ${String(level.id).padStart(2, '0')}`
    this.root.querySelector<HTMLElement>('#activity-title')!.textContent = this.activityHeading()
    this.root.querySelector<HTMLElement>('.activity-heading p')!.textContent = level.objective
    this.root.querySelector<HTMLElement>('.activity-count')!.textContent = this.activityProgress()
    this.root.querySelector<HTMLElement>('.activity-content')!.innerHTML = this.activityMarkup()
    this.root.querySelector<HTMLElement>('.feedback-strip span:last-child')!.textContent = this.progress.statusMessage
    this.root.querySelector<HTMLElement>('.feedback-icon')!.textContent = this.progress.phase === 'outcome' ? this.progress.latestOutcome?.passed ? '✓' : '↺' : 'i'
    this.root.querySelector<HTMLElement>('.resource-grid')!.innerHTML = this.resourcesMarkup()
    this.root.querySelector<HTMLElement>('.objective-card .level-number')!.textContent = String(level.id).padStart(2, '0')
    this.root.querySelector<HTMLElement>('.objective-badge')!.innerHTML = `${escapeHtml(level.badgeMark)} ${escapeHtml(level.badge)}`
    this.root.querySelector<HTMLElement>('.objective-card h2')!.textContent = level.shortTitle
    this.root.querySelector<HTMLElement>('.objective-card > p')!.textContent = level.objective
    this.root.querySelector<HTMLElement>('.objective-risk small')!.textContent = level.risk
    this.root.querySelector<HTMLElement>('.objective-checklist')!.innerHTML = `<b>MISSION CHECKLIST</b>${this.checklistMarkup()}`
    this.root.querySelector<HTMLElement>('.control-message small')!.textContent = level.missionControl
    this.root.querySelector<HTMLElement>('.field-panel > p')!.textContent = level.event
    this.root.querySelector<HTMLElement>('.event-status')!.innerHTML = `<span class="live-dot" aria-hidden="true"></span>${this.eventStatus()}`
    this.root.querySelector<HTMLElement>('.crew-health')!.textContent = `${Math.round(this.progress.resources.health)}%`
    this.root.querySelector<HTMLElement>('.badge-card small')!.textContent = this.progress.badges.length ? this.progress.badges[this.progress.badges.length - 1] : `Complete Level ${level.id} to earn ${level.badge}.`
    this.root.querySelector<HTMLElement>('.badge-card b')!.textContent = this.progress.badges.length ? `${this.progress.badges.length} BADGE${this.progress.badges.length === 1 ? '' : 'S'} EARNED` : 'BADGE AWAITS'
    this.root.querySelector<HTMLElement>('.log-list')!.innerHTML = this.logMarkup()
    this.root.querySelector<HTMLElement>('.readiness-score b')!.textContent = String(readinessScore(this.progress.skills))
    this.root.querySelector<HTMLElement>('.skill-list')!.innerHTML = this.skillsMarkup()
    this.root.querySelector<HTMLElement>('.welcome-overlay')!.classList.toggle('is-visible', this.progress.phase === 'welcome')
    this.root.querySelector<HTMLElement>('.welcome-overlay')!.toggleAttribute('hidden', this.progress.phase !== 'welcome')
    this.root.querySelector<HTMLElement>('[data-action="sound"]')?.setAttribute('aria-pressed', String(!this.settings.data.muted))
    this.root.querySelector<HTMLElement>('[data-action="sound"] span[aria-hidden="true"]')!.textContent = this.settings.data.muted ? '♩̸' : '♫'
    this.root.querySelector<HTMLElement>('[data-action="motion"]')?.setAttribute('aria-pressed', String(this.settings.data.reducedMotion))
    this.scene.setMission(level, this.progress.resources)
    saveProgress(this.progress)
    this.renderReportDialog()
  }

  private renderReportDialog(): void {
    const dialog = this.root.querySelector<HTMLDialogElement>('#report-dialog')!
    const best = this.progress.decisions.find(d => d.risk === 'low')
    const riskiest = [...this.progress.decisions].reverse().find(d => d.risk === 'high') ?? [...this.progress.decisions].reverse().find(d => d.risk === 'medium')
    const strong = strongestSkill(this.progress.skills)
    const weak = weakestSkill(this.progress.skills)
    const resourceKeys: ResourceKey[] = ['oxygen', 'water', 'power', 'food', 'health', 'materials']
    const protectedSystems = resourceKeys.filter(key => this.progress.resources[key] >= this.progress.initialResources[key]).map(key => RESOURCE_META[key].label).slice(0, 3).join(', ') || 'No system stayed above its starting reserve yet.'
    const neglectedSystems = resourceKeys.filter(key => this.progress.resources[key] < this.progress.initialResources[key]).map(key => RESOURCE_META[key].label).slice(0, 3).join(', ') || 'No major system was neglected.'
    const categoryKeys: SkillKey[] = ['safety', 'resourceManagement', 'planning', 'science', 'emergencyResponse', 'teamwork', 'sustainability', 'explanation']
    const outcome = this.progress.latestOutcome
    dialog.innerHTML = `<button class="dialog-close" type="button" data-close aria-label="Close mission report">×</button><div class="report-hero"><span class="report-orbit" aria-hidden="true">✦</span><div><span class="section-kicker">MISSION MEMORY · ${outcome ? `LEVEL ${String(outcome.level).padStart(2, '0')}` : 'LIVE PROFILE'}</span><h2 id="report-title">${escapeHtml(outcome?.passed ? outcome.title : this.titleForSkill(strong))}</h2><p>${escapeHtml(outcome?.summary ?? 'Your mission memory grows with every choice and explanation.')}</p></div></div><div class="report-scoreboard"><div><span>MISSION READINESS</span><b>${readinessScore(this.progress.skills)}<small>/100</small></b><p>Safety, planning, teamwork, and reasoning all count.</p></div><div><span>MISSIONS COMPLETE</span><b>${this.progress.completedLevels.length}<small>/10</small></b><p>${this.progress.badges.length} badges earned</p></div><div><span>MISSION TIME</span><b>${this.missionClock()}</b><p>Saved in this browser</p></div></div><div class="report-columns"><section><h3>Readiness profile</h3>${categoryKeys.map(key => `<div class="report-skill"><span>${escapeHtml(SKILL_META[key].label)}</span><b>${Math.round(this.progress.skills[key])}%</b><i><em style="--value:${Math.round(this.progress.skills[key])}%"></em></i></div>`).join('')}</section><section><h3>Mission memory</h3><div class="memory-line"><b>BEST DECISION</b><p>${escapeHtml(best?.title ?? (this.progress.decisions[0]?.title ?? 'Your system matches and preparation choices are building your record.'))}</p></div><div class="memory-line"><b>RISKIEST DECISION</b><p>${escapeHtml(riskiest?.title ?? 'No high-risk decision recorded yet.')}</p></div><div class="memory-line"><b>SYSTEMS PROTECTED</b><p>${escapeHtml(protectedSystems)}</p></div><div class="memory-line"><b>SYSTEMS NEGLECTED</b><p>${escapeHtml(neglectedSystems)}</p></div><div class="memory-line"><b>STRONGEST SKILL</b><p>${escapeHtml(SKILL_META[strong].label)}</p></div><div class="memory-line"><b>SKILL TO PRACTICE</b><p>${escapeHtml(SKILL_META[weak].label)} · ${escapeHtml(outcome?.nextTraining ?? 'Try the next unlocked mission.')}</p></div><div class="memory-callout">You protected the systems that keep the crew alive. Next, practice balancing safety with science.</div></section></div><div class="report-actions"><button class="secondary-button" type="button" data-close>RETURN TO MISSION</button>${outcome ? '<button class="secondary-button" type="button" data-action="retry">RETRY LEVEL</button>' : ''}${outcome?.passed && this.progress.unlockedThrough > this.progress.currentLevel && getLevel(this.progress.currentLevel + 1) ? '<button class="primary-button" type="button" data-action="continue">CONTINUE TRAINING</button>' : ''}</div>`
  }

  private titleForSkill(key: SkillKey): string {
    const titles: Record<SkillKey, string> = { safety: 'The Careful Systems Thinker', resourceManagement: 'The Resource Pathfinder', planning: 'The Thoughtful Mission Planner', science: 'The Curious Field Scientist', emergencyResponse: 'The Steady Problem Solver', teamwork: 'The Crew-First Teammate', sustainability: 'The Sustainable Explorer', explanation: 'The Clear-Reasoning Cadet' }
    return titles[key]
  }

  private persist(): void {
    saveProgress(this.progress)
    this.scene.setMission(this.activeLevel(), this.progress.resources)
  }
  private announce(message: string): void { this.root.querySelector<HTMLElement>('[data-announcer]')!.textContent = message }
  private dialog(id: string): HTMLDialogElement { return this.root.querySelector<HTMLDialogElement>(`#${id}`)! }
  private openDialog(id: string): void { const dialog = this.dialog(id); if (!dialog.open) dialog.showModal() }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.mobileNavOpen) { this.mobileNavOpen = false; this.render(); this.root.querySelector<HTMLButtonElement>('[data-action="mobile-menu"]')?.focus() }
      return
    }
    if (event.key !== 'Tab' || this.progress.phase !== 'welcome') return
    const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('.welcome-overlay button:not(:disabled)'))
    if (buttons.length < 2) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && this.root.ownerDocument.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && this.root.ownerDocument.activeElement === last) { event.preventDefault(); first.focus() }
  }

  private onChange(event: Event): void {
    const target = (event.target as HTMLElement).closest<HTMLInputElement>('[data-call-sign]')
    if (target) { this.progress.callSign = target.value.trim().slice(0, 16) || 'CADET'; this.persist() }
  }
  private onInput(event: Event): void {
    const target = event.target as HTMLElement
    if (target.matches('[data-explanation]')) {
      this.progress.explanationDraft = (target as HTMLTextAreaElement).value.slice(0, 160)
      saveProgress(this.progress)
      const count = target.closest('.decision-reason')?.querySelector('output')
      if (count) count.textContent = `${this.progress.explanationDraft.length}/160`
      return
    }
    if (target.matches('[data-call-sign]')) { this.progress.callSign = (target as HTMLInputElement).value.trim().slice(0, 16) || 'CADET'; saveProgress(this.progress); this.root.querySelector('.profile-copy b')!.textContent = this.progress.callSign }
  }

  private onClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-level], [data-system], [data-gear], [data-supply], [data-decision], [data-close]')
    if (!target) return
    if (target.hasAttribute('data-close')) { target.closest('dialog')?.close(); return }
    this.audio.unlock()
    const action = target.dataset.action
    if (action === 'start-fresh') { this.progress = beginMission(createFreshProgress(), 1); this.mobileNavOpen = false; this.render(); this.root.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }); this.announce('Level 1 started: Welcome to Astronaut Training.'); return }
    if (action === 'continue-demo') { this.progress = beginMission(this.progress, Math.min(this.progress.currentLevel, this.progress.unlockedThrough)); this.render(); this.root.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }); this.announce(`Continuing Level ${this.progress.currentLevel}.`); return }
    if (action === 'mobile-menu') { this.mobileNavOpen = !this.mobileNavOpen; this.render(); return }
    if (action === 'home') { if (this.progress.phase === 'welcome') return; this.progress = { ...this.progress, phase: 'welcome' }; this.render(); this.root.querySelector<HTMLButtonElement>('[data-action="start-fresh"]')?.focus({ preventScroll: true }); return }
    if (action === 'sound') { this.settings.update({ muted: !this.settings.data.muted }); this.audio.setVolumes(this.settings.data.musicVolume, this.settings.data.sfxVolume, this.settings.data.muted); this.audio.play('ui'); this.render(); return }
    if (action === 'motion') { this.settings.update({ reducedMotion: !this.settings.data.reducedMotion }); this.scene.reducedMotion = this.settings.data.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches; this.render(); return }
    if (action === 'zoom-in') { this.scene.setZoom(1); return }
    if (action === 'zoom-out') { this.scene.setZoom(-1); return }
    if (action === 'reset-view') { this.scene.resetView(); return }
    if (action === 'help') { this.openDialog('help-dialog'); return }
    if (action === 'report') { this.renderReportDialog(); this.openDialog('report-dialog'); return }
    if (action === 'reset') { this.openDialog('reset-dialog'); return }
    if (action === 'credits') { this.openDialog('credits-dialog'); return }
    if (action === 'profile') { this.renderReportDialog(); this.openDialog('report-dialog'); return }
    if (action === 'confirm-reset') { this.dialog('reset-dialog').close(); clearProgress(); this.progress = resetToFresh(); this.mobileNavOpen = false; this.render(); this.root.querySelector<HTMLButtonElement>('[data-action="start-fresh"]')?.focus({ preventScroll: true }); this.announce('Training progress reset. Start at Level 1.'); return }
    if (action === 'toggle-log') { this.showAllLog = !this.showAllLog; this.root.querySelector('.log-list')!.innerHTML = this.logMarkup(); const b = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-log"]'); if (b) b.textContent = this.showAllLog ? 'Recent' : 'View all'; return }
    if (action === 'clear-log') { this.progress = { ...this.progress, missionLog: [] }; this.persist(); this.root.querySelector('.log-list')!.innerHTML = this.logMarkup(); this.announce('Mission log cleared.'); return }
    if (action === 'next-quiz') { this.showQuizFeedback = false; this.render(); this.root.querySelector('.scenario-main')?.scrollIntoView({ block: 'nearest', behavior: this.settings.data.reducedMotion ? 'instant' : 'smooth' }); return }
    if (action === 'confirm-loadout') { this.progress = confirmLoadout(this.progress, Date.now(), this.progress.explanationDraft); this.render(); return }
    if (action === 'confirm-kit') { this.progress = confirmKit(this.progress, Date.now(), this.progress.explanationDraft); this.render(); return }
    if (action === 'confirm-decision') { this.progress = confirmDecision(this.progress, Date.now(), this.progress.explanationDraft); this.render(); return }
    if (action === 'retry') { this.dialog('report-dialog').close(); this.progress = retryMission(this.progress); this.showQuizFeedback = false; this.render(); this.root.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }); return }
    if (action === 'continue') {
      const next = this.progress.currentLevel + 1
      if (getLevel(next) && next <= this.progress.unlockedThrough) this.progress = beginMission(this.progress, next)
      this.dialog('report-dialog').close(); this.render(); this.root.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }); return
    }
    if (target.dataset.level) {
      const levelId = Number(target.dataset.level)
      const level = getLevel(levelId)
      if (level && levelId <= this.progress.unlockedThrough) { this.progress = beginMission(this.progress, levelId); this.mobileNavOpen = false; this.showQuizFeedback = false; this.render(); this.root.querySelector('.mission-main')?.scrollTo({ top: 0, behavior: this.settings.data.reducedMotion ? 'instant' : 'smooth' }) }
      return
    }
    if (target.dataset.system) {
      const beforeIndex = this.progress.quizIndex
      const oldCorrect = this.progress.quizCorrect
      this.progress = answerSystem(this.progress, target.dataset.system)
      this.showQuizFeedback = this.progress.phase === 'playing' && this.progress.quizIndex > beforeIndex
      this.persist(); this.render()
      if (this.showQuizFeedback) this.announce(this.progress.quizCorrect > oldCorrect ? 'Correct system match.' : 'Review the system clue.')
      return
    }
    if (target.dataset.gear) { this.progress = toggleGear(this.progress, target.dataset.gear); this.persist(); this.render(); return }
    if (target.dataset.supply) { this.progress = toggleSupply(this.progress, target.dataset.supply); this.persist(); this.render(); return }
    if (target.dataset.decision) { this.progress = selectDecision(this.progress, target.dataset.decision); this.persist(); this.render(); return }
  }
}
