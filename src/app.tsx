import { useEffect, useState } from 'preact/hooks';
import { generatePlan } from './domain/planner';
import { applyFeedback, carryProgress, feedbackToApply } from './domain/progression';
import type { Equipment, Profile, Schedule, WorkoutRecord } from './domain/types';
import { unlockAudio } from './services/audio';
import { type AppState, DEFAULT_STATE, loadState, saveState } from './services/storage';
import { TabBar, type Tab } from './ui/components/TabBar';
import { History } from './ui/screens/History';
import { Home } from './ui/screens/Home';
import { Onboarding } from './ui/screens/Onboarding';
import { PlanView } from './ui/screens/PlanView';
import { Settings } from './ui/screens/Settings';
import { Summary } from './ui/screens/Summary';
import { Workout } from './ui/screens/Workout';

type Route =
  | { name: 'onboarding' }
  | { name: 'plan'; fresh?: boolean }
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'workout'; index: number }
  | { name: 'summary'; record: WorkoutRecord };

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const { profile, schedule, equipment, plan } = state;
  const ready = profile && schedule && equipment && plan;
  const [route, setRoute] = useState<Route>(ready ? { name: 'home' } : { name: 'onboarding' });

  useEffect(() => saveState(state), [state]);
  useEffect(() => window.scrollTo(0, 0), [route.name]);

  const complete = (p: Profile, s: Schedule, e: Equipment) => {
    const fresh = generatePlan(p, s, e);
    const next = state.plan ? carryProgress(state.plan, fresh, e.bands) : fresh;
    setState((st) => ({ ...st, profile: p, schedule: s, equipment: e, plan: next }));
    setRoute({ name: 'plan', fresh: true });
  };

  if (route.name === 'onboarding' || !ready) {
    return (
      <Onboarding
        initial={{ profile, schedule, equipment }}
        onComplete={complete}
        onCancel={ready ? () => setRoute({ name: 'settings' }) : undefined}
      />
    );
  }

  if (route.name === 'workout') {
    return (
      <Workout
        session={plan.sessions[route.index]}
        profile={profile}
        equipment={equipment}
        settings={state.settings}
        onFinish={(record) => setRoute({ name: 'summary', record })}
        onQuit={() => setRoute({ name: 'home' })}
      />
    );
  }

  if (route.name === 'summary') {
    return (
      <Summary
        record={route.record}
        onSave={(record) => {
          const feedback = feedbackToApply(record);
          setState((st) => ({
            ...st,
            history: [...st.history, record],
            plan: feedback && st.plan && st.equipment ? applyFeedback(st.plan, record.sessionId, feedback, st.equipment.bands) : st.plan,
          }));
          setRoute({ name: 'home' });
        }}
      />
    );
  }

  if (route.name === 'plan' && route.fresh) {
    return <PlanView plan={plan} schedule={schedule} equipment={equipment} fresh onHome={() => setRoute({ name: 'home' })} onEdit={() => {}} onRegenerate={() => {}} />;
  }

  const tab: Tab = route.name;
  return (
    <>
      {route.name === 'home' && (
        <Home
          plan={plan}
          schedule={schedule}
          equipment={equipment}
          profile={profile}
          history={state.history}
          onPlan={() => setRoute({ name: 'plan' })}
          onStart={(index) => {
            unlockAudio();
            setRoute({ name: 'workout', index });
          }}
        />
      )}
      {route.name === 'plan' && (
        <PlanView
          plan={plan}
          schedule={schedule}
          equipment={equipment}
          fresh={false}
          onHome={() => setRoute({ name: 'home' })}
          onEdit={() => setRoute({ name: 'onboarding' })}
          onRegenerate={() => {
            const next = carryProgress(plan, generatePlan(profile, schedule, equipment, new Date(), plan), equipment.bands);
            setState((st) => ({ ...st, plan: next }));
            setRoute({ name: 'plan', fresh: true });
          }}
        />
      )}
      {route.name === 'history' && <History history={state.history} />}
      {route.name === 'settings' && (
        <Settings
          profile={profile}
          settings={state.settings}
          onSettings={(settings) => setState((st) => ({ ...st, settings }))}
          onEdit={() => setRoute({ name: 'onboarding' })}
          onReset={() => {
            setState(DEFAULT_STATE);
            setRoute({ name: 'onboarding' });
          }}
        />
      )}
      <TabBar current={tab} onChange={(name) => setRoute({ name } as Route)} />
    </>
  );
}
