import { COLORS } from '../../domain/colors';
import type { ColorId } from '../../domain/types';

export function BandLoop({ color, size = 30, tilt = -12, stroke }: { color: string; size?: number; tilt?: number; stroke?: number }) {
  const h = (size * 2) / 3;
  return (
    <svg width={size} height={h} viewBox="0 0 30 20" aria-hidden="true">
      <ellipse cx="15" cy="10" rx="11.5" ry="6.5" fill="none" stroke={color} stroke-width={stroke ?? 4} transform={`rotate(${tilt} 15 10)`} />
    </svg>
  );
}

export function PlatformIcon({ handles, size = 30, board = 'var(--primary)' }: { handles?: ColorId; size?: number; board?: string }) {
  const h = handles ? COLORS[handles].hex : '#E3383B';
  return (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" aria-hidden="true">
      <rect x="2" y="4" width="26" height="12" rx="3.5" style={{ fill: board }} />
      <rect x="6" y="6.5" width="2" height="7" rx="1" fill={h} />
      <rect x="22" y="6.5" width="2" height="7" rx="1" fill={h} />
    </svg>
  );
}

const ctrl = { width: 18, height: 18, viewBox: '0 0 16 16', 'aria-hidden': true } as const;

export const IconPrev = () => (
  <svg {...ctrl}>
    <path d="M3 2v12" stroke="currentColor" stroke-width="2" />
    <path d="M14 2 5 8l9 6z" fill="currentColor" />
  </svg>
);

export const IconNext = () => (
  <svg {...ctrl}>
    <path d="M13 2v12" stroke="currentColor" stroke-width="2" />
    <path d="M2 2l9 6-9 6z" fill="currentColor" />
  </svg>
);

export const IconPause = () => (
  <svg width="24" height="26" viewBox="0 0 22 24" aria-hidden="true">
    <rect x="3" y="2" width="5.5" height="20" rx="1.5" fill="currentColor" />
    <rect x="13.5" y="2" width="5.5" height="20" rx="1.5" fill="currentColor" />
  </svg>
);

export const IconPlay = () => (
  <svg width="24" height="26" viewBox="0 0 22 24" aria-hidden="true">
    <path d="M5 2.5v19l15-9.5z" fill="currentColor" />
  </svg>
);

export const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M3 3l12 12M15 3 3 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

export const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <path d="M4 11.5l4.5 4.5L18 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    <circle cx="8" cy="4.9" r="1" fill="currentColor" />
  </svg>
);

export const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M3.5 5h11M7 5V3.5h4V5M5 5l.8 10h6.4L13 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const IconToday = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <ellipse cx="12" cy="12" rx="8.5" ry="5" fill="none" stroke="currentColor" stroke-width="2.4" transform="rotate(-14 12 12)" />
  </svg>
);

export const IconPlan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

export const IconHistory = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 18l4.5-6 3.5 3.5L16 9l4 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const IconProfile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);
