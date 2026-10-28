/*
 * Disegni per gli esercizi senza una foto adatta.
 * Ogni posa è una figura stilizzata costruita da angoli (cinematica diretta), così le proporzioni
 * restano uguali in tutti i disegni. Angoli in gradi: 0 = verso il basso, 90 = verso destra,
 * 180 = verso l'alto, -90 = verso sinistra. Il busto si misura dalla verticale (0 = dritto).
 */
type P = [number, number];
type Joint = 'nearElbow' | 'nearHand' | 'farElbow' | 'farHand' | 'nearKnee' | 'nearFoot' | 'farKnee' | 'farFoot';

interface Limbs {
  arm: [number, number];
  leg: [number, number];
}

type Prop =
  | { kind: 'band'; a: P | Joint; b: P | Joint; behind?: boolean }
  | { kind: 'door'; x: number }
  | { kind: 'mat'; x1: number; x2: number }
  | { kind: 'arrow'; d: string }
  | { kind: 'label'; text: string };

export interface Pose {
  hip: P;
  torso: number;
  near: Limbs;
  far: Limbs;
  override?: Partial<Record<Joint, P>>;
  props?: Prop[];
  /** Vista frontale: i due lati hanno lo stesso colore. */
  front?: boolean;
}

const LEN = { torso: 44, head: 14, upper: 22, fore: 20, thigh: 28, shin: 30 };
const INK = '#231942';
const FAR = '#A9A3C2';
const GROUND = 140;

const rad = (d: number) => (d * Math.PI) / 180;
const limb = (from: P, angle: number, len: number): P => [from[0] + len * Math.sin(rad(angle)), from[1] + len * Math.cos(rad(angle))];

function joints(p: Pose) {
  const t = rad(p.torso);
  const neck: P = [p.hip[0] + LEN.torso * Math.sin(t), p.hip[1] - LEN.torso * Math.cos(t)];
  const head: P = [neck[0] + LEN.head * Math.sin(t), neck[1] - LEN.head * Math.cos(t)];
  const o = p.override ?? {};
  const side = (s: Limbs, which: 'near' | 'far') => {
    const elbow = o[`${which}Elbow`] ?? limb(neck, s.arm[0], LEN.upper);
    const hand = o[`${which}Hand`] ?? limb(elbow, s.arm[1], LEN.fore);
    const knee = o[`${which}Knee`] ?? limb(p.hip, s.leg[0], LEN.thigh);
    const foot = o[`${which}Foot`] ?? limb(knee, s.leg[1], LEN.shin);
    return { elbow, hand, knee, foot };
  };
  return { hip: p.hip, neck, head, near: side(p.near, 'near'), far: side(p.far, 'far') };
}

const f = (n: number) => n.toFixed(1);
const path = (pts: P[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}`;
const stroke = (d: string, color: string, width: number) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

function renderPose(p: Pose, band: string, uid: string): string {
  const j = joints(p);
  const at = (x: P | Joint): P => {
    if (typeof x !== 'string') return x;
    const which = x.startsWith('near') ? j.near : j.far;
    const part = x.replace(/^(near|far)/, '').toLowerCase() as 'elbow' | 'hand' | 'knee' | 'foot';
    return which[part];
  };
  const props = p.props ?? [];
  const bands = (behind: boolean) =>
    props
      .filter((x): x is Extract<Prop, { kind: 'band' }> => x.kind === 'band' && !!x.behind === behind)
      .map((x) => stroke(path([at(x.a), at(x.b)]), band, 4))
      .join('');

  const out: string[] = [];
  out.push(`<line x1="8" y1="${GROUND + 1}" x2="192" y2="${GROUND + 1}" stroke="#D9D6E3" stroke-width="2"/>`);
  for (const x of props) {
    if (x.kind === 'door') out.push(`<rect x="${x.x}" y="-14" width="7" height="${GROUND + 14}" fill="#DCD8E6"/>`);
    if (x.kind === 'mat') out.push(`<rect x="${x.x1}" y="${GROUND - 2}" width="${x.x2 - x.x1}" height="4" rx="2" fill="#C9C1E6"/>`);
  }
  out.push(bands(true));
  const farColor = p.front ? INK : FAR;
  out.push(stroke(path([j.neck, j.far.elbow, j.far.hand]), farColor, 8));
  out.push(stroke(path([j.hip, j.far.knee, j.far.foot]), farColor, 8));
  if (p.front) {
    out.push(stroke(path([j.hip, j.near.knee, j.near.foot]), INK, 8));
    out.push(stroke(path([j.neck, j.near.elbow, j.near.hand]), INK, 8));
  }
  out.push(stroke(path([j.hip, j.neck]), INK, 11));
  out.push(`<circle cx="${f(j.head[0])}" cy="${f(j.head[1])}" r="9" fill="${INK}"/>`);
  if (!p.front) {
    out.push(stroke(path([j.hip, j.near.knee, j.near.foot]), INK, 8));
    out.push(stroke(path([j.neck, j.near.elbow, j.near.hand]), INK, 8));
  }
  out.push(bands(false));
  for (const x of props) {
    if (x.kind === 'arrow') out.push(`<path d="${x.d}" fill="none" stroke="#6B48A8" stroke-width="2" stroke-linecap="round" marker-end="url(#${uid})"/>`);
    if (x.kind === 'label') out.push(`<text x="100" y="-2" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#6E6A80">${x.text}</text>`);
  }
  return out.join('');
}

const standing: Pick<Pose, 'hip' | 'torso'> = { hip: [100, 82], torso: 0 };
const down: Limbs['arm'] = [6, 4];

const march = (lead: 'near' | 'far'): Pose => {
  const up: Limbs = { arm: [-35, -15], leg: [75, 0] };
  const support: Limbs = { arm: [35, 70], leg: [0, 0] };
  return { ...standing, near: lead === 'near' ? up : support, far: lead === 'near' ? support : up };
};

const MARCH = [march('near'), march('far')];

export const ILLUSTRATIONS: Record<string, Pose[]> = {
  'mob-marcia': MARCH,
  'marcia-veloce': MARCH,

  'st-respiro': [
    {
      hip: [92, 128],
      torso: 0,
      near: { arm: [41, 0], leg: [75, -95] },
      far: { arm: [25, 70], leg: [70, -100] },
      override: { nearElbow: [108, 100], nearHand: [100, 106] },
      props: [{ kind: 'mat', x1: 60, x2: 150 }, { kind: 'arrow', d: 'M106 112 L120 112' }, { kind: 'label', text: 'Inspira in 4 secondi' }],
    },
    {
      hip: [92, 128],
      torso: 0,
      near: { arm: [41, 0], leg: [75, -95] },
      far: { arm: [25, 70], leg: [70, -100] },
      override: { nearElbow: [108, 100], nearHand: [100, 106] },
      props: [{ kind: 'mat', x1: 60, x2: 150 }, { kind: 'arrow', d: 'M122 112 L108 112' }, { kind: 'label', text: 'Espira in 6 secondi' }],
    },
  ],

  'pushup-ginocchia': [
    {
      hip: [84, 116],
      torso: 66,
      near: { arm: [0, 0], leg: [-30, -110] },
      far: { arm: [0, 0], leg: [-30, -110] },
      override: { nearHand: [124, 140], farHand: [124, 140] },
      props: [{ kind: 'mat', x1: 30, x2: 160 }],
    },
    {
      hip: [94, 126],
      torso: 80,
      near: { arm: [-60, 0], leg: [-60, -110] },
      far: { arm: [-60, 0], leg: [-60, -110] },
      override: { nearHand: [124, 140], farHand: [124, 140] },
      props: [{ kind: 'mat', x1: 30, x2: 160 }, { kind: 'arrow', d: 'M164 96 L164 116' }],
    },
  ],

  'pike-pushup': [
    { hip: [86, 84], torso: 112, near: { arm: [15, 15], leg: [-15, -15] }, far: { arm: [15, 15], leg: [-15, -15] }, props: [{ kind: 'mat', x1: 50, x2: 160 }] },
    {
      hip: [86, 84],
      torso: 125,
      near: { arm: [60, -8], leg: [-15, -15] },
      far: { arm: [60, -8], leg: [-15, -15] },
      props: [{ kind: 'mat', x1: 50, x2: 160 }, { kind: 'arrow', d: 'M158 98 L158 118' }],
    },
  ],

  'rematore-piedi': [
    {
      hip: [118, 82],
      torso: 6,
      near: { arm: [-80, -80], leg: [-12, -2] },
      far: { arm: [-80, -80], leg: [10, 4] },
      props: [{ kind: 'door', x: 28 }, { kind: 'band', a: [35, 46], b: 'nearHand' }],
    },
    {
      hip: [118, 82],
      torso: 6,
      near: { arm: [35, -90], leg: [-12, -2] },
      far: { arm: [35, -90], leg: [10, 4] },
      props: [{ kind: 'door', x: 28 }, { kind: 'band', a: [35, 46], b: 'nearHand' }, { kind: 'arrow', d: 'M86 70 L104 70' }],
    },
  ],

  'pulldown-elastico': [
    {
      ...standing,
      front: true,
      near: { arm: [160, 170], leg: [6, 6] },
      far: { arm: [-160, -170], leg: [-6, -6] },
      props: [{ kind: 'band', a: 'farHand', b: 'nearHand', behind: true }],
    },
    {
      ...standing,
      front: true,
      near: { arm: [50, 160], leg: [6, 6] },
      far: { arm: [-50, -160], leg: [-6, -6] },
      props: [{ kind: 'band', a: 'farHand', b: 'nearHand', behind: true }, { kind: 'arrow', d: 'M146 18 L146 40' }],
    },
  ],

  'bird-dog': [
    { hip: [80, 112], torso: 71.5, near: { arm: [0, 0], leg: [0, -90] }, far: { arm: [0, 0], leg: [0, -90] }, props: [{ kind: 'mat', x1: 40, x2: 150 }] },
    {
      hip: [80, 112],
      torso: 71.5,
      near: { arm: [95, 95], leg: [0, -90] },
      far: { arm: [0, 0], leg: [-95, -95] },
      props: [{ kind: 'mat', x1: 40, x2: 150 }],
    },
  ],

  hollow: [
    { hip: [84, 131], torso: 90, near: { arm: [90, 90], leg: [-90, -90] }, far: { arm: [90, 90], leg: [-90, -90] }, props: [{ kind: 'mat', x1: 20, x2: 180 }] },
    {
      hip: [84, 131],
      torso: 80,
      near: { arm: [100, 100], leg: [-105, -105] },
      far: { arm: [100, 100], leg: [-105, -105] },
      props: [{ kind: 'mat', x1: 20, x2: 180 }, { kind: 'arrow', d: 'M30 100 L30 86' }, { kind: 'arrow', d: 'M168 100 L168 86' }],
    },
  ],

  'shadow-boxing': [
    { hip: [98, 84], torso: 6, near: { arm: [40, 170], leg: [18, -2] }, far: { arm: [30, 160], leg: [-22, -10] } },
    { hip: [98, 84], torso: 6, near: { arm: [85, 88], leg: [18, -2] }, far: { arm: [30, 160], leg: [-22, -10] } },
  ],

  'jumping-jack': [
    { ...standing, front: true, near: { arm: down, leg: [3, 3] }, far: { arm: [-6, -4], leg: [-3, -3] } },
    { hip: [100, 76], torso: 0, front: true, near: { arm: [150, 155], leg: [20, 20] }, far: { arm: [-150, -155], leg: [-20, -20] } },
  ],

  burpee: [
    {
      hip: [104, 102],
      torso: 75,
      near: { arm: [12, 12], leg: [70, -20] },
      far: { arm: [8, 8], leg: [66, -16] },
      override: { nearHand: [156, 140], farHand: [152, 140] },
    },
    { hip: [99.5, 115.1], torso: 67, near: { arm: [0, 0], leg: [-67, -67] }, far: { arm: [0, 0], leg: [-67, -67] } },
    { hip: [100, 80], torso: 0, near: { arm: [168, 175], leg: [8, -4] }, far: { arm: [160, 170], leg: [-6, 4] }, props: [{ kind: 'arrow', d: 'M146 70 L146 48' }] },
  ],
};

export function illustrationSvg(id: string, frame: number, band: string): string {
  const pose = ILLUSTRATIONS[id][frame];
  const uid = `arr-${id}-${frame}`;
  return (
    `<svg viewBox="0 -14 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<defs><marker id="${uid}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#6B48A8"/></marker></defs>` +
    `<rect x="0" y="-14" width="200" height="160" fill="#F4F3F8"/>` +
    renderPose(pose, band, uid) +
    `</svg>`
  );
}
