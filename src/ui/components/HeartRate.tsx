import { useEffect, useState } from 'preact/hooks';
import { connectHr, disconnectHr, hrSnapshot, subscribeHr } from '../../services/heartRateDevice';

export function useHr() {
  const [s, set] = useState(hrSnapshot());
  useEffect(() => subscribeHr(set), []);
  return s;
}

export function WatchRow() {
  const hr = useHr();
  if (hr.status === 'unsupported') {
    return (
      <>
        <div class="list">
          <div class="row">
            Orologio
            <span class="r">non disponibile qui</span>
          </div>
        </div>
        <p class="note">Questo browser non legge il battito via Bluetooth (succede su iPhone). Le calorie saranno stimate da peso, durata ed esercizi.</p>
      </>
    );
  }
  if (hr.status === 'connected') {
    return (
      <div class="list">
        <button type="button" class="row" onClick={disconnectHr} aria-label="Scollega l'orologio">
          {hr.deviceName}
          <span class="r ok">{hr.bpm ? `${hr.bpm} bpm` : 'collegato'}</span>
        </button>
      </div>
    );
  }
  return (
    <>
      <div class="list">
        <button type="button" class="row" disabled={hr.status === 'connecting'} onClick={() => void connectHr()}>
          Orologio o fascia cardio
          <span class="r link">{hr.status === 'connecting' ? 'Collegamento…' : hr.status === 'error' ? 'Riprova' : 'Collega'}</span>
        </button>
      </div>
      <p class="note">{hr.error ?? 'Con il battito le calorie sono più precise. Su Garmin, Polar e simili attiva prima "trasmetti frequenza cardiaca".'}</p>
    </>
  );
}
