import { useMemo, useState } from "react";
import { PerformanceDashboard } from "../../components/PerformanceDashboard";
import type {
  CustomMentalModule,
  MentalCategory,
  ModuleDashboard,
  PerformanceSession,
} from "../../models/performance";

interface MentalScreenProps {
  dashboard: ModuleDashboard;
  sessions: PerformanceSession[];
  customModules: CustomMentalModule[];
  onSave: (session: {
    module: "mental";
    category: string;
    duration: number;
    intensityOrFocus: number;
    metadata: Record<string, string | number | boolean | undefined>;
    notes?: string;
  }) => void;
  onAddCustomModule: (module: Omit<CustomMentalModule, "id">) => CustomMentalModule;
}

const modules: Array<{ id: MentalCategory; label: string }> = [
  { id: "reading", label: "Reading" },
  { id: "meditation", label: "Meditation" },
  { id: "breathing", label: "Breathing" },
  { id: "gratitude", label: "Gratitude" },
  { id: "journaling", label: "Journaling" },
  { id: "custom", label: "Custom" },
];

const readingTypes = ["Self-dev", "Fiction", "Study"];
const calmTechniques = ["Box", "Body scan", "Open focus", "Breath count"];
const gratitudeDepth = ["Quick", "Detailed"];
const journalTypes = ["Reflection", "Planning", "Emotional"];
const journalLengths = ["Short", "Medium", "Long"];
const metricTypes: Array<CustomMentalModule["metricType"]> = ["time", "count", "scale"];

export function MentalScreen({
  dashboard,
  sessions,
  customModules,
  onSave,
  onAddCustomModule,
}: MentalScreenProps) {
  const [module, setModule] = useState<MentalCategory>("reading");
  const [duration, setDuration] = useState(15);
  const [focus, setFocus] = useState(3);
  const [pages, setPages] = useState(12);
  const [readingType, setReadingType] = useState("Self-dev");
  const [technique, setTechnique] = useState("Box");
  const [calmLevel, setCalmLevel] = useState(3);
  const [distractionLevel, setDistractionLevel] = useState(2);
  const [entriesCount, setEntriesCount] = useState(3);
  const [depth, setDepth] = useState("Quick");
  const [moodAfter, setMoodAfter] = useState(4);
  const [journalType, setJournalType] = useState("Reflection");
  const [journalLength, setJournalLength] = useState("Short");
  const [clarity, setClarity] = useState(3);
  const [customName, setCustomName] = useState("");
  const [metricType, setMetricType] = useState<CustomMentalModule["metricType"]>("time");
  const [customMetric, setCustomMetric] = useState(5);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");

  const recentSessions = useMemo(() => sessions.filter((session) => session.module === "mental").slice(0, 4), [sessions]);

  const save = () => {
    let category: string = module;
    let sessionDuration = duration;
    let intensityOrFocus = focus;
    let metadata: Record<string, string | number | boolean | undefined>;

    if (module === "reading") {
      metadata = { pages, type: readingType };
    } else if (module === "meditation" || module === "breathing") {
      intensityOrFocus = calmLevel;
      metadata = { technique, calmLevel, distractionLevel };
    } else if (module === "gratitude") {
      sessionDuration = Math.max(3, entriesCount * 2);
      intensityOrFocus = moodAfter;
      metadata = { entriesCount, depth, moodAfter };
    } else if (module === "journaling") {
      sessionDuration = journalLength === "Short" ? 8 : journalLength === "Medium" ? 18 : 30;
      intensityOrFocus = clarity;
      metadata = { type: journalType, length: journalLength, clarity };
    } else {
      const savedModule = onAddCustomModule({ name: customName || "Custom habit", metricType, notes });
      category = savedModule.name || customName || "custom";
      sessionDuration = metricType === "time" ? customMetric : Math.max(5, customMetric * 3);
      intensityOrFocus = metricType === "scale" ? customMetric : focus;
      metadata = { metricType, value: customMetric, customModuleId: savedModule.id };
    }

    onSave({
      module: "mental",
      category,
      duration: sessionDuration,
      intensityOrFocus,
      metadata,
      notes,
    });
    setFeedback(`${category} saved to current week.`);
    setNotes("");
    window.setTimeout(() => setFeedback(""), 1800);
  };

  return (
    <div className="screen-stack performance-page mental-page">
      <header className="section-header compact-header">
        <div>
          <p className="eyebrow">Cognitive</p>
          <h1>Mental</h1>
          <p>Structured cognitive modules with focus, recovery, and consistency signals.</p>
        </div>
      </header>

      <div className="module-tabs" aria-label="Mental module selection">
        {modules.map((item) => (
          <button
            key={item.id}
            type="button"
            className={module === item.id ? "active" : ""}
            onClick={() => setModule(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="input-card premium-card strong">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Input</p>
            <h2>{modules.find((item) => item.id === module)?.label}</h2>
          </div>
          <span className="load-chip">{module === "gratitude" ? `${entriesCount} entries` : `${duration}m`}</span>
        </div>

        {module === "reading" ? (
          <div className="quick-cluster">
            <div className="chip-row">
              {readingTypes.map((type) => (
                <button key={type} type="button" className={readingType === type ? "chip active" : "chip"} onClick={() => setReadingType(type)}>
                  {type}
                </button>
              ))}
            </div>
            <div className="stepper-grid">
              <label>
                Pages
                <input type="number" min="1" value={pages} onChange={(event) => setPages(Number(event.target.value))} />
              </label>
              <label>
                Focus
                <input type="range" min="1" max="5" value={focus} onChange={(event) => setFocus(Number(event.target.value))} />
              </label>
            </div>
          </div>
        ) : module === "meditation" || module === "breathing" ? (
          <div className="quick-cluster">
            <div className="chip-row">
              {calmTechniques.map((type) => (
                <button key={type} type="button" className={technique === type ? "chip active" : "chip"} onClick={() => setTechnique(type)}>
                  {type}
                </button>
              ))}
            </div>
            <div className="range-grid">
              <label>
                Calm
                <input type="range" min="1" max="5" value={calmLevel} onChange={(event) => setCalmLevel(Number(event.target.value))} />
              </label>
              <label>
                Distraction
                <input type="range" min="1" max="5" value={distractionLevel} onChange={(event) => setDistractionLevel(Number(event.target.value))} />
              </label>
            </div>
          </div>
        ) : module === "gratitude" ? (
          <div className="quick-cluster">
            <div className="chip-row">
              {gratitudeDepth.map((type) => (
                <button key={type} type="button" className={depth === type ? "chip active" : "chip"} onClick={() => setDepth(type)}>
                  {type}
                </button>
              ))}
            </div>
            <div className="stepper-grid">
              <label>
                Entries
                <input type="number" min="1" value={entriesCount} onChange={(event) => setEntriesCount(Number(event.target.value))} />
              </label>
              <label>
                Mood after
                <input type="range" min="1" max="5" value={moodAfter} onChange={(event) => setMoodAfter(Number(event.target.value))} />
              </label>
            </div>
          </div>
        ) : module === "journaling" ? (
          <div className="quick-cluster">
            <div className="chip-row">
              {journalTypes.map((type) => (
                <button key={type} type="button" className={journalType === type ? "chip active" : "chip"} onClick={() => setJournalType(type)}>
                  {type}
                </button>
              ))}
            </div>
            <div className="chip-row">
              {journalLengths.map((length) => (
                <button key={length} type="button" className={journalLength === length ? "chip active" : "chip"} onClick={() => setJournalLength(length)}>
                  {length}
                </button>
              ))}
            </div>
            <label>
              Clarity
              <input type="range" min="1" max="5" value={clarity} onChange={(event) => setClarity(Number(event.target.value))} />
            </label>
          </div>
        ) : (
          <div className="quick-cluster">
            <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Habit name" />
            <div className="chip-row">
              {metricTypes.map((type) => (
                <button key={type} type="button" className={metricType === type ? "chip active" : "chip"} onClick={() => setMetricType(type)}>
                  {type}
                </button>
              ))}
            </div>
            <label>
              Metric
              <input type="range" min="1" max={metricType === "scale" ? 5 : 60} value={customMetric} onChange={(event) => setCustomMetric(Number(event.target.value))} />
            </label>
          </div>
        )}

        {module === "reading" || module === "meditation" || module === "breathing" ? (
          <label>
            Duration
            <input type="range" min="5" max="90" step="5" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </label>
        ) : null}

        <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note" />
        <button type="button" className="primary-button full-width" onClick={save}>
          Save Session
        </button>
        {feedback ? <p className="inline-feedback">{feedback}</p> : null}
      </section>

      {customModules.length > 0 ? (
        <section className="custom-module-strip">
          {customModules.slice(0, 3).map((item) => (
            <article key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.metricType}</span>
            </article>
          ))}
        </section>
      ) : null}

      <PerformanceDashboard dashboard={dashboard} scoreLabel="Avg focus" />

      <section className="coach-card premium-card">
        <p className="eyebrow">AI Coaching</p>
        {dashboard.coaching.length > 0 ? dashboard.coaching.map((item) => <p key={item}>{item}</p>) : <p>Log one cognitive session to activate mental coaching.</p>}
      </section>

      <section className="recent-strip">
        {recentSessions.map((session) => (
          <article key={session.id}>
            <strong>{session.category}</strong>
            <span>{session.duration}m / focus {session.intensityOrFocus}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
