import { describe, it, expect } from 'vitest'
import { soundSynth } from '../lib/soundSynthesis'

describe('Sound Synthesizer Engine', () => {
  it('handles "off" sound mode gracefully without errors', () => {
    expect(() => soundSynth.playKey('off', 0.5, false)).not.toThrow()
  })

  it('handles zero volume without triggering audio nodes', () => {
    expect(() => soundSynth.playKey('mechanical', 0, false)).not.toThrow()
  })

  it('safely triggers error sound buzz', () => {
    expect(() => soundSynth.playKey('mechanical', 0.5, true)).not.toThrow()
  })

  it('handles success arpeggio safely', () => {
    expect(() => soundSynth.playSuccess(0.5)).not.toThrow()
  })
})
