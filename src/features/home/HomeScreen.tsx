import type { AnalyseDashboard, AppSection, AriseScore, ModuleDashboard, UserProfile } from "../../models/performance";
import { weekdayLabel } from "../../utils/date";

interface HomeScreenProps {
  score: AriseScore;
  training: ModuleDashboard;
  mental: ModuleDashboard;
  analysis: AnalyseDashboard;
  profile: UserProfile;
  onNavigate: (section: AppSection) => void;
  onOpenAnalysis: () => void;
}

function signedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function HomeScreen({ score, training, mental, analysis, profile, onNavigate, onOpenAnalysis }: HomeScreenProps) {
  return (
    <div className="screen-stack home-screen">
      <header className="section-header compact-header">
        <div>
          <p className="eyebrow">{weekdayLabel()}</p>
          <h1>ARISE OS</h1>
          <p>{profile.focusAreas.join(" / ")}</p>
        </div>
      </header>

      <section className="score-card premium-card strong">
        <div>
          <p className="eyebrow">ARISE Score</p>
          <h2>{score.weeklyScore}</h2>
          <p>Daily {score.dailyScore} / Trend {score.trend}</p>
        </div>
        <div className="score-ring" aria-label={`Weekly ARISE score ${score.weeklyScore}`}>
          <strong>{score.weeklyScore}</strong>
          <span>Weekly</span>
        </div>
      </section>

      <section className="domain-grid">
        <button type="button" className="domain-card premium-card" onClick={() => onNavigate("training")}>
          <span className="eyebrow">Physical</span>
          <strong>Training</strong>
          <small>{training.totalSessions} sessions / {training.totalTime}m</small>
        </button>
        <button type="button" className="domain-card premium-card" onClick={() => onNavigate("mental")}>
          <span className="eyebrow">Cognitive</span>
          <strong>Mental</strong>
          <small>{mental.totalSessions} sessions / {mental.consistency}% consistency</small>
        </button>
      </section>

      <section className="analysis-card premium-card strong">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Analyse</p>
            <h2>Performance dashboard</h2>
          </div>
          <button type="button" className="secondary-button compact" onClick={onOpenAnalysis}>
            Open Analyse
          </button>
        </div>

        <div className="analysis-preview-grid">
          <article className="metric-tile">
            <span>Weekly training trend</span>
            <strong>{signedPercent(analysis.preview.trainingTrend)}</strong>
            <small>Load vs last week</small>
          </article>
          <article className="metric-tile">
            <span>Weekly mental trend</span>
            <strong>{signedPercent(analysis.preview.mentalTrend)}</strong>
            <small>Focus and consistency</small>
          </article>
          <article className="metric-tile">
            <span>Monthly progress</span>
            <strong>{signedPercent(analysis.preview.monthlyTrend)}</strong>
            <small>Score vs last month</small>
          </article>
          <article className="metric-tile">
            <span>ARISE score development</span>
            <strong>{signedPercent(analysis.preview.scoreTrend)}</strong>
            <small>Current vs previous week</small>
          </article>
        </div>

        <div className="analysis-preview-foot">
          <p>Last week vs current week shows training {signedPercent(analysis.preview.trainingTrend)} and mental {signedPercent(analysis.preview.mentalTrend)}.</p>
          <button type="button" className="text-button" onClick={onOpenAnalysis}>
            View full analysis
          </button>
        </div>
      </section>

      <section className="coach-card premium-card">
        <p className="eyebrow">Combined Coaching</p>
        {score.coaching.length > 0 ? (
          score.coaching.map((item) => <p key={item}>{item}</p>)
        ) : (
          <p>Log physical and cognitive sessions to activate combined coaching.</p>
        )}
      </section>

      <section className="overview-comparison">
        <article className="metric-tile">
          <span>Training trend</span>
          <strong>{training.improvementPercent > 0 ? "+" : ""}{training.improvementPercent}%</strong>
          <small>vs previous week</small>
        </article>
        <article className="metric-tile">
          <span>Mental trend</span>
          <strong>{mental.improvementPercent > 0 ? "+" : ""}{mental.improvementPercent}%</strong>
          <small>vs previous week</small>
        </article>
      </section>
    </div>
  );
}
