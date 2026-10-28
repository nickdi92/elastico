import { IconHistory, IconPlan, IconProfile, IconToday } from './icons';

export type Tab = 'home' | 'plan' | 'history' | 'settings';

const TABS: [Tab, string, () => preact.JSX.Element][] = [
  ['home', 'Oggi', IconToday],
  ['plan', 'Piano', IconPlan],
  ['history', 'Storico', IconHistory],
  ['settings', 'Profilo', IconProfile],
];

export function TabBar({ current, onChange }: { current: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav class="tabbar" aria-label="Sezioni">
      {TABS.map(([id, label, Icon]) => (
        <button type="button" key={id} aria-current={current === id ? 'page' : undefined} onClick={() => onChange(id)}>
          <Icon />
          {label}
        </button>
      ))}
    </nav>
  );
}
