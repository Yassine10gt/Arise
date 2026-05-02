import { useMemo, useState } from "react";
import { PerformanceDashboard } from "../../components/PerformanceDashboard";
import type { ModuleDashboard, PerformanceSession, TrainingCategory } from "../../models/performance";

interface TrainingScreenProps {
  dashboard: ModuleDashboard;
  sessions: PerformanceSession[];
  onSave: (session: {
    module: "training";
    category: string;
    duration: number;
    intensityOrFocus: number;
    metadata: Record<string, string | number | boolean | undefined>;
    notes?: string;
  }) => void;
}

const sports: Array<{ id: TrainingCategory; label: string }> = [
  { id: "gym", label: "Gym" },
  { id: "running", label: "Running" },
  { id: "tennis", label: "Tennis" },
  { id: "padel", label: "Padel" },
  { id: "football", label: "Football" },
  { id: "boxing", label: "Boxing" },
  { id: "swimming", label: "Swimming" },
  { id: "custom", label: "Custom" },
];

const workoutTypes = ["Push", "Pull", "Legs", "Full"];
const courtTypes = ["Drill", "Match", "Conditioning"];
const boxingTypes = ["Bag", "Sparring", "Technique"];
const swimTypes = ["Intervals", "Endurance", "Technique"];

export function TrainingScreen({ dashboard, sessions, onSave }: TrainingScreenProps) {
  const [sport, setSport] = useState<TrainingCategory>("gym");
  const [duration, setDuration] = useState(35);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState("");
  const [customSport, setCustomSport] = useState("");
  const [workoutType, setWorkoutType] = useState("Push");
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(60);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [distance, setDistance] = useState(5);
  const [sportMode, setSportMode] = useState("Drill");
  const [feedback, setFeedback] = useState("");

  const recentSessions = useMemo(() => sessions.filter((session) => session.module === "training").slice(0, 4), [sessions]);

  const save = () => {
    const category = sport === "custom" ? customSport.trim() || "custom" : sport;
    const metadata =
      sport === "gym"
        ? { workoutType, sets, reps, weight, energyLevel }
        : sport === "running"
          ? { distance }
          : sport === "boxing"
            ? { sessionType: sportMode }
            : sport === "swimming"
              ? { sessionType: sportMode }
              : sport === "custom"
                ? { customSport: category }
                : { sessionType: sportMode };

    onSave({
      module: "training",
      category,
      duration,
      intensityOrFocus: intensity,
      metadata,
      notes,
    });
    setFeedback(`${category} saved to current week.`);
    setNotes("");
    window.setTimeout(() => setFeedback(""), 1800);
  };

  const modeOptions =
    sport === "boxing"
      ? boxingTypes
      : sport === "swimming"
        ? swimTypes
        : courtTypes;

  return (
    <div className="screen-stack performance-page training-page">
      <header className="section-header compact-header">
        <div>
          <p className="eyebrow">Physical</p>
          <h1>Training</h1>
          <p>Fast sport logging, weekly comparison, and physical coaching.</p>
        </div>
      </header>

      <div className="module-tabs" aria-label="Sport selection">
        {sports.map((item) => (
          <button
            key={item.id}
            type="button"
            className={sport === item.id ? "active" : ""}
            onClick={() => setSport(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="input-card premium-card strong">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Input</p>
            <h2>{sports.find((item) => item.id === sport)?.label}</h2>
          </div>
          <span className="load-chip">{duration}m / {intensity}</span>
        </div>

        {sport === "custom" ? (
          <input value={customSport} onChange={(event) => setCustomSport(event.target.value)} placeholder="Sport name" />
        ) : null}

        {sport === "gym" ? (
          <div className="quick-cluster">
            <div className="chip-row">
              {workoutTypes.map((type) => (
                <button key={type} type="button" className={workoutType === type ? "chip active" : "chip"} onClick={() => setWorkoutType(type)}>
                  {type}
                </button>
              ))}
            </div>
            <div className="stepper-grid">
              <label>
                Sets
                <input type="number" min="1" value={sets} onChange={(event) => setSets(Number(event.target.value))} />
              </label>
              <label>
                Reps
                <input type="number" min="1" value={reps} onChange={(event) => setReps(Number(event.target.value))} />
              </label>
              <label>
                Weight
                <input type="number" min="0" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
              </label>
              <label>
                Energy
                <input type="range" min="1" max="5" value={energyLevel} onChange={(event) => setEnergyLevel(Number(event.target.value))} />
              </label>
            </div>
          </div>
        ) : sport === "running" ? (
          <label>
            Distance km
            <input type="number" min="0" step="0.5" value={distance} onChange={(event) => setDistance(Number(event.target.value))} />
          </label>
        ) : sport !== "custom" ? (
          <div className="chip-row">
            {modeOptions.map((type) => (
              <button key={type} type="button" className={sportMode === type ? "chip active" : "chip"} onClick={() => setSportMode(type)}>
                {type}
              </button>
            ))}
          </div>
        ) : null}

        <div className="range-grid">
          <label>
            Duration
            <input type="range" min="5" max="120" step="5" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </label>
          <label>
            Intensity
            <input type="range" min="1" max="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} />
          </label>
        </div>

        <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note" />
        <button type="button" className="primary-button full-width" onClick={save}>
          Save Session
        </button>
        {feedback ? <p className="inline-feedback">{feedback}</p> : null}
      </section>

      <PerformanceDashboard dashboard={dashboard} scoreLabel="Avg intensity" />

      <section className="coach-card premium-card">
        <p className="eyebrow">AI Coaching</p>
        {dashboard.coaching.length > 0 ? dashboard.coaching.map((item) => <p key={item}>{item}</p>) : <p>Log one session to activate physical coaching.</p>}
      </section>

      <section className="recent-strip">
        {recentSessions.map((session) => (
          <article key={session.id}>
            <strong>{session.category}</strong>
            <span>{session.duration}m / intensity {session.intensityOrFocus}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
