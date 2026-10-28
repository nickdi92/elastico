interface Sentinel {
  release(): Promise<void>;
}

let sentinel: Sentinel | null = null;
let wanted = false;

async function acquire() {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Sentinel> } }).wakeLock;
    sentinel = (await wl?.request('screen')) ?? null;
  } catch {
    sentinel = null;
  }
}

function onVisibility() {
  if (wanted && document.visibilityState === 'visible') void acquire();
}

/** Tiene lo schermo acceso durante l'allenamento. */
export function keepAwake(): void {
  wanted = true;
  void acquire();
  document.addEventListener('visibilitychange', onVisibility);
}

export function allowSleep(): void {
  wanted = false;
  document.removeEventListener('visibilitychange', onVisibility);
  void sentinel?.release();
  sentinel = null;
}
