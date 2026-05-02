import { MetricTile } from "../../components/ui/MetricTile";
import type { AnalyseDashboard, AriseScore } from "../../models/performance";

interface AnalyseScreenProps {
  analysis: AnalyseDashboard;
  score: AriseScore;
  onBack: () => void;
}

function signedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

function signedValue(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function ComparisonRows({
  title,
  metrics,
}: {
  title: string;
  metrics: AnalyseDashboard["weeklyTraining"]["metrics"];
}) {
  return (
    <div className="analysis-rows">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Comparison</p>
          <h2>{title}</h2>
        </div>
      </div>

      {metrics.map((metric) => {
        const maxValue = Math.max(metric.current, metric.previous, 1);

        return (
          <article key={metric.label} className="analysis-row">
            <div className="analysis-row-top">
              <strong>{metric.label}</strong>
              <span>{metric.currentLabel} vs {metric.previousLabel}</span>
            </div>
            <div className="analysis-bars">
              <div>
                <small>This week</small>
                <span style={{ width: `${(metric.current / maxValue) * 100}%` }} />
              </div>
              <div className="muted">
                <small>Previous</small>
                <span style={{ width: `${(metric.previous / maxValue) * 100}%` }} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function AnalyseScreen({ analysis, score, onBack }: AnalyseScreenProps) {
  const maxMonthScore = Math.max(...analysis.monthly.points.map((point) => point.ariseScore), 1);

  return (
    <div className="screen-stack analysis-page">
      <header className="section-header compact-header">
        <div>
          <p className="eyebrow">Analyse</p>
          <h1>Performance Dashboard</h1>
          <p>Weekly and monthly tracking across physical output, cognitive consistency, and ARISE score movement.</p>
        </div>
        <button type="button" className="secondary-button compact" onClick={onBack}>
          Back to Home
        </button>
      </header>

      <section className="analysis-hero premium-card strong">
        <div>
          <p className="eyebrow">ARISE Overview</p>
          <h2>{score.weeklyScore}</h2>
          <p>Daily {score.dailyScore} / Weekly trend {score.trend}</p>
        </div>
        <div className="metric-grid">
          <MetricTile label="Training trend" value={signedPercent(analysis.preview.trainingTrend)} detail="Weekly load" />
          <MetricTile label="Mental trend" value={signedPercent(analysis.preview.mentalTrend)} detail="Weekly focus" />
          <MetricTile label="Monthly progress" value={signedPercent(analysis.preview.monthlyTrend)} detail="Score vs last month" />
          <MetricTile label="Score development" value={signedPercent(analysis.preview.scoreTrend)} detail="This week vs last week" />
        </div>
      </section>

      <section className="analytics-section premium-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Weekly Training Graph</p>
            <h2>Physical output</h2>
          </div>
          <span className="load-chip">{analysis.weeklyTraining.totalSessions} sessions</span>
        </div>

        <div className="metric-grid three">
          <MetricTile label="Sessions" value={String(analysis.weeklyTraining.totalSessions)} detail="Current week" />
          <MetricTile label="Total minutes" value={`${analysis.weeklyTraining.totalTime}m`} detail="Current week" />
          <MetricTile label="Avg intensity" value={String(analysis.weeklyTraining.averageIntensity)} detail="1-5 scale" />
        </div>

        <ComparisonRows title="Current week vs previous week" metrics={analysis.weeklyTraining.metrics} />
      </section>

      <section className="analytics-section premium-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Weekly Mental Graph</p>
            <h2>Cognitive consistency</h2>
          </div>
          <span className="load-chip">{analysis.weeklyMental.consistency}% consistency</span>
        </div>

        <div className="metric-grid three">
          <MetricTile label="Sessions" value={String(analysis.weeklyMental.totalSessions)} detail="Completed habits" />
          <MetricTile label="Avg focus" value={String(analysis.weeklyMental.averageFocus)} detail="1-5 scale" />
          <MetricTile label="Mood / energy" value={String(analysis.weeklyMental.moodAverage)} detail="Average state" />
        </div>

        <ComparisonRows title="Current week vs previous week" metrics={analysis.weeklyMental.metrics} />
      </section>

      <section className="analytics-section premium-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Monthly Progress Graph</p>
            <h2>Recent weekly development</h2>
          </div>
          {analysis.monthly.bestWeekLabel ? (
            <span className="load-chip">Best week {analysis.monthly.bestWeekLabel}</span>
          ) : null}
        </div>

        <div className="month-bar-chart" aria-label="Monthly ARISE score trend">
          {analysis.monthly.points.map((point) => (
            <article key={point.weekKey}>
              <div>
                <span style={{ height: `${Math.max(12, (point.ariseScore / maxMonthScore) * 100)}%` }} />
              </div>
              <strong>{point.ariseScore}</strong>
              <small>{point.label}</small>
            </article>
          ))}
        </div>

        <div className="monthly-point-grid">
          {analysis.monthly.points.map((point) => (
            <article key={point.weekKey} className="monthly-point-card">
              <div className="monthly-point-top">
                <strong>{point.label}</strong>
                <span>ARISE {point.ariseScore}</span>
              </div>
              <div className="monthly-track">
                <small>Training</small>
                <div className="progress-track full">
                  <span style={{ width: `${point.trainingConsistency}%` }} />
                </div>
              </div>
              <div className="monthly-track">
                <small>Mental</small>
                <div className="progress-track full">
                  <span style={{ width: `${point.mentalConsistency}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="analytics-section premium-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Comparison</p>
            <h2>Balance and change</h2>
          </div>
        </div>

        <div className="metric-grid">
          <MetricTile label="This week vs last week" value={signedValue(analysis.comparison.weekDelta)} detail="ARISE score delta" />
          <MetricTile label="This month vs last month" value={signedValue(analysis.comparison.monthDelta)} detail="Average weekly score" />
          <MetricTile label="Physical balance" value={`${analysis.comparison.physicalBalance}%`} detail="Current load share" />
          <MetricTile label="Mental balance" value={`${analysis.comparison.mentalBalance}%`} detail="Current load share" />
        </div>
      </section>

      <section className="analytics-section premium-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Smart Insights</p>
            <h2>Pattern-based coaching</h2>
          </div>
        </div>

        <div className="insight-list">
          {analysis.insights.length > 0 ? (
            analysis.insights.map((item) => <article key={item}>{item}</article>)
          ) : (
            <article>Log more sessions to unlock sharper weekly and monthly pattern analysis.</article>
          )}
        </div>
      </section>
    </div>
  );
}
