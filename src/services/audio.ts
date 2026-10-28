let ctx: AudioContext | null = null;

/** Va chiamato da un gesto dell'utente (es. "Inizia") per sbloccare l'audio su iOS. */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    speechSynthesis?.getVoices();
  } catch {
    ctx = null;
  }
}

export function beep(freq = 880, durationMs = 120, volume = 0.25): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = 'sine';
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + durationMs / 1000 + 0.02);
}

let italianVoice: SpeechSynthesisVoice | null | undefined;

function voice(): SpeechSynthesisVoice | null {
  if (italianVoice !== undefined) return italianVoice;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  italianVoice = voices.find((v) => v.lang.startsWith('it')) ?? null;
  return italianVoice;
}

export function speak(text: string): void {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  const v = voice();
  if (v) u.voice = v;
  u.rate = 1.05;
  speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
