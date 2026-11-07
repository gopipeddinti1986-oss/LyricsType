import type { KeyboardSound } from '@/types'

class SoundSynthesizer {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Plays a simulated mechanical / thock / typewriter key sound.
   */
  public playKey(sound: KeyboardSound, volume: number = 0.5, isError: boolean = false) {
    if (sound === 'off' || volume <= 0) return

    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume * 0.8, now)
    masterGain.connect(ctx.destination)

    if (isError) {
      // Dull low error buzz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12)
      gain.gain.setValueAtTime(volume * 0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now)
      osc.stop(now + 0.12)
      return
    }

    switch (sound) {
      case 'mechanical': {
        // Crisp Cherry MX Blue style click
        // 1. High frequency click burst
        const osc = ctx.createOscillator()
        const clickGain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(2200 + Math.random() * 400, now)
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.035)

        clickGain.gain.setValueAtTime(volume * 0.5, now)
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)
        osc.connect(clickGain)
        clickGain.connect(masterGain)
        osc.start(now)
        osc.stop(now + 0.035)

        // 2. Plastic bottom-out resonance
        const thud = ctx.createOscillator()
        const thudGain = ctx.createGain()
        thud.type = 'sine'
        thud.frequency.setValueAtTime(320, now)
        thud.frequency.exponentialRampToValueAtTime(120, now + 0.05)
        thudGain.gain.setValueAtTime(volume * 0.35, now)
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
        thud.connect(thudGain)
        thudGain.connect(masterGain)
        thud.start(now)
        thud.stop(now + 0.05)
        break
      }

      case 'thock': {
        // Deep lubed linear / Topre "Thock" sound
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(280 + Math.random() * 40, now)
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.065)

        gain.gain.setValueAtTime(volume * 0.7, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(now)
        osc.stop(now + 0.065)
        break
      }

      case 'typewriter': {
        // Metallic typewriter strike + subtle ring
        const strike = ctx.createOscillator()
        const strikeGain = ctx.createGain()
        strike.type = 'square'
        strike.frequency.setValueAtTime(1400, now)
        strike.frequency.exponentialRampToValueAtTime(220, now + 0.04)

        strikeGain.gain.setValueAtTime(volume * 0.3, now)
        strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
        strike.connect(strikeGain)
        strikeGain.connect(masterGain)
        strike.start(now)
        strike.stop(now + 0.04)
        break
      }

      case 'beep': {
        // Soft arcade blip
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(580 + Math.random() * 80, now)
        gain.gain.setValueAtTime(volume * 0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(now)
        osc.stop(now + 0.045)
        break
      }

      default:
        break
    }
  }

  /**
   * Sound effect when user completes an entire line or reaches a milestone.
   */
  public playSuccess(volume: number = 0.5) {
    const ctx = this.getContext()
    if (!ctx || volume <= 0) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteTime)
      gain.gain.setValueAtTime(volume * 0.35, noteTime)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(noteTime)
      osc.stop(noteTime + 0.15)
    })
  }
}

export const soundSynth = new SoundSynthesizer()
