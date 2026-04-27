import { useSettingsStore } from '../store/settingsStore'
import { useCallback, useRef } from 'react'

export type SoundType = 'correct' | 'wrong' | 'streak' | 'rankUp' | 'timeout' | 'tick'

function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
}

function playCorrect(ctx: AudioContext) {
  const t = ctx.currentTime
  ;[523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, t + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2)
    osc.start(t + i * 0.08)
    osc.stop(t + i * 0.08 + 0.2)
  })
}

function playWrong(ctx: AudioContext) {
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, t)
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.3)
  gain.gain.setValueAtTime(0.3, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc.start(t); osc.stop(t + 0.3)
}

function playStreak(ctx: AudioContext) {
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'square'
    gain.gain.setValueAtTime(0.15, t + i * 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15)
    osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.15)
  })
}

function playRankUp(ctx: AudioContext) {
  const t = ctx.currentTime
  ;[392, 523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'triangle'
    gain.gain.setValueAtTime(0.25, t + i * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3)
    osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.3)
  })
}

function playTimeout(ctx: AudioContext) {
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, t)
  osc.frequency.setValueAtTime(330, t + 0.15)
  gain.gain.setValueAtTime(0.3, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
  osc.start(t); osc.stop(t + 0.4)
}

function playTick(ctx: AudioContext) {
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.value = 880
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.15, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
  osc.start(t); osc.stop(t + 0.05)
}

export function useSoundEffect() {
  const soundEnabled = useSettingsStore(s => s.soundEnabled)
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback((): AudioContext | null => {
    if (!soundEnabled) return null
    if (!ctxRef.current) ctxRef.current = createAudioContext()
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [soundEnabled])

  const play = useCallback((type: SoundType) => {
    const ctx = getCtx()
    if (!ctx) return
    try {
      switch (type) {
        case 'correct':  playCorrect(ctx);  break
        case 'wrong':    playWrong(ctx);    break
        case 'streak':   playStreak(ctx);   break
        case 'rankUp':   playRankUp(ctx);   break
        case 'timeout':  playTimeout(ctx);  break
        case 'tick':     playTick(ctx);     break
      }
    } catch {
      // AudioContext can fail silently in some environments
    }
  }, [getCtx])

  return { play }
}
