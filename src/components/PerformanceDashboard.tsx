import type { ModuleDashboard } from "../models/performance";
import { weekdayShort } from "../utils/date";

interface PerformanceDashboardProps {
  dashboard: ModuleDashboard;
  scoreLabel: string;
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function PerformanceDashboard({ dashboard, scoreLabel }: PerformanceDashboardProps) {
  const maxCategory = Math.max(...dashboard.categoryTotals.map((entry) => entry.value), 1);
  const comparisonTone =
    dashboard.improvementPercent > 0
      ? "positive"
      : dashboard.improvementPercent < 0
        ? "negative"
        : "neutral";

  return (
    <section className="performance-dashboard">
      <div className="dashboard-grid">
        <article className="metric-tile">
          <span>Sessions</span>
          <strong>{dashboard.totalSessions}</strong>
          <small>{signed(dashboard.sessionDelta)} vs previous</small>
        </article>
        <article className="metric-tile">
          <span>Total time</span>
          <strong>{dashboard.totalTime}m</strong>
          <small>{signed(dashboard.timeDelta)}m vs previous</small>
        </article>
        <article className="metric-tile">
          <span>{scoreLabel}</span>
          <strong>{dashboard.averageScore || "-"}</strong>
          <small>{signed(dashboard.scoreDelta)} score shift</small>
        </article>
        <article className="metric-tile">
          <span>{dashboard.module === "training" ? "Active days" : "Consistency"}</span>
          <strong>{dashboard.module === "training" ? dashboard.activeDays : `${dashboard.consistency}%`}</strong>
          <small>{dashboard.activeDays}/7 days</small>
        </article>
      </div>

      <div className="comparison-card premium-card soft">
        <div>
          <p className="eyebrow">Weekly Comparison</p>
          <h2 className={`comparison-value ${comparisonTone}`}>
            {dashboard.improvementPercent > 0 ? "+" : ""}
            {dashboard.improvementPercent}%
          </h2>
          <p>This week vs previous week</p>
        </div>
        <div className="mini-bars" aria-label="Weekly comparison chart">
          <span style={{ height: `${Math.max(12, dashboard.previousSessions * 18)}px` }} />
          <span style={{ height: `${Math.max(12, dashboard.totalSessions * 18)}px` }} />
        </div>
      </div>

      <div className="category-chart premium-card soft">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Distribution</p>
            <h2>Current week</h2>
          </div>
          {dashboard.bestDay ? <span className="load-chip">Best {weekdayShort(dashboard.bestDay)}</span> : null}
        </div>
        {dashboard.categoryTotals.length > 0 ? (
          dashboard.categoryTotals.map((entry) => (
            <article key={entry.category}>
              <span>{entry.category}</span>
              <div className="progress-track">
                <span style={{ width: `${(entry.value / maxCategory) * 100}%` }} />
              </div>
              <strong>{entry.value}</strong>
            </article>
          ))
        ) : (
          <p className="empty-copy">No sessions stored for this week yet.</p>
        )}
      </div>
    </section>
  );
}
