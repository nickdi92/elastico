import { useEffect, useState } from 'preact/hooks';
import type { ActiveWorkout } from './domain/activeWorkout';
import { removeRecord, upsertRecord } from './domain/history';
import { generatePlan } from './domain/planner';
import { applyFeedback, carryProgress, feedbackToApply } from './domain/progression';
import type { Equipment, Profile, Schedule, WorkoutRecord } from './domain/types';
import { unlockAudio } from './services/audio';
import { type AppState, DEFAULT_STATE, clearActive, loadActive, loadState, saveState } from './services/storage';
import { ActiveBar } from './ui/components/ActiveBar';
import { TabBar, type Tab } from './ui/components/TabBar';
import { History } from './ui/screens/History';
import { Home } from './ui/screens/Home';
import { Onboarding } from './ui/screens/Onboarding';
import { PlanView } from './ui/screens/PlanView';
import { RecordEdit } from './ui/screens/RecordEdit';
import { Settings } from './ui/screens/Settings';
import { Summary } from './ui/screens/Summary';
import { Workout } from './ui/screens/Workout';

type Route =
  | { name: 'onboarding' }
  | { name: 'plan'; fresh?: boolean }
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'record'; record?: WorkoutRecord }
  /** Senza index riprende l'allenamento in pausa. */
  | { name: 'workout'; index?: number }
  | { name: 'summary'; record: WorkoutRecord };

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const { profile, schedule, equipment, plan } = state;
  const ready = profile && schedule && equipment && plan;
  const [route, setRoute] = useState<Route>(ready ? { name: 'home' } : { name: 'onboarding' });
  /** Allenamento lasciato in pausa. Mentre è aperto lo salva Workout stesso; qui serve per riprenderlo. */
  const [active, setActive] = useState<ActiveWorkout | null>(loadActive);

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

  const endActive = () => {
    clearActive();
    setActive(null);
  };
  const resume = () => {
    unlockAudio();
    setRoute({ name: 'workout' });
  };

  if (route.name === 'workout') {
    const resuming = route.index === undefined && active;
    return (
      <Workout
        session={resuming ? active.session : plan.sessions[route.index ?? 0]}
        saved={resuming || undefined}
        profile={profile}
        equipment={equipment}
        settings={state.settings}
        onFinish={(record) => {
          endActive();
          setRoute({ name: 'summary', record });
        }}
        onMinimize={(a) => {
          setActive(a);
          setRoute({ name: 'home' });
        }}
        onQuit={() => {
          endActive();
          setRoute({ name: 'home' });
        }}
      />
    );
  }

  if (route.name === 'record') {
    return (
      <RecordEdit
        record={route.record}
        plan={plan}
        profile={profile}
        history={state.history}
        onSave={(record) => {
          setState((st) => ({ ...st, history: upsertRecord(st.history, record) }));
          setRoute({ name: 'history' });
        }}
        onCancel={() => setRoute({ name: 'history' })}
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
            history: upsertRecord(st.history, record),
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
          active={active}
          onResume={resume}
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
      {route.name === 'history' && (
        <History
          history={state.history}
          onAdd={() => setRoute({ name: 'record' })}
          onEdit={(record) => setRoute({ name: 'record', record })}
          onDelete={(id) => setState((st) => ({ ...st, history: removeRecord(st.history, id) }))}
        />
      )}
      {route.name === 'settings' && (
        <Settings
          profile={profile}
          settings={state.settings}
          onSettings={(settings) => setState((st) => ({ ...st, settings }))}
          onEdit={() => setRoute({ name: 'onboarding' })}
          onReset={() => {
            endActive();
            setState(DEFAULT_STATE);
            setRoute({ name: 'onboarding' });
          }}
        />
      )}
      {active && route.name !== 'home' && <ActiveBar active={active} equipment={equipment} onResume={resume} />}
      <TabBar current={tab} onChange={(name) => setRoute({ name } as Route)} />
    </>
  );
}
