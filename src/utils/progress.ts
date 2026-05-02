import type {
  AnalyseDashboard,
  AnalysisMetricPoint,
  AriseScore,
  ModuleDashboard,
  MonthlyAnalysisPoint,
  PerformanceModule,
  PerformanceSession,
  WeekStorage,
  WeeklySummary,
} from "../models/performance";
import { formatDisplayDate, fromISODate, getStartOfWeek, toISODate, weekdayShort } from "./date";

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getWeekKey(date = new Date()) {
  const start = getStartOfWeek(date);
  return toISODate(start);
}

export function createWeekStorage(date = new Date()): WeekStorage {
  return {
    weekKey: getWeekKey(date),
    currentWeek: [],
    previousWeek: [],
  };
}

export function ensureWeekStorage(storage: WeekStorage, date = new Date()): WeekStorage {
  const weekKey = getWeekKey(date);

  if (storage.weekKey === weekKey) {
    return storage;
  }

  return {
    weekKey,
    previousWeek: storage.currentWeek,
    currentWeek: [],
  };
}

export function rolloverWeekStorage(
  storage: WeekStorage,
  history: WeeklySummary[],
  date = new Date(),
) {
  const weekKey = getWeekKey(date);

  if (storage.weekKey === weekKey) {
    return {
      weekStorage: storage,
      weekHistory: normalizeWeekHistory(history),
    };
  }

  return {
    weekStorage: {
      weekKey,
      previousWeek: storage.currentWeek,
      currentWeek: [],
    },
    weekHistory: upsertWeeklySummary(history, buildWeeklySummary(storage.weekKey, storage.currentWeek)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 1) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function moduleSessions(sessions: PerformanceSession[], module: PerformanceModule) {
  return sessions.filter((session) => session.module === module);
}

function averageScore(sessions: PerformanceSession[]) {
  if (sessions.length === 0) {
    return 0;
  }

  return round(
    sessions.reduce((total, session) => total + session.intensityOrFocus, 0) / sessions.length,
  );
}

function totalTime(sessions: PerformanceSession[]) {
  return sessions.reduce((total, session) => total + session.duration, 0);
}

function uniqueDays(sessions: PerformanceSession[]) {
  return new Set(sessions.map((session) => session.timestamp.slice(0, 10)));
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function dayScores(sessions: PerformanceSession[]) {
  const scores = new Map<string, number>();

  for (const session of sessions) {
    const day = session.timestamp.slice(0, 10);
    const value = session.duration * Math.max(1, session.intensityOrFocus);
    scores.set(day, (scores.get(day) ?? 0) + value);
  }

  return [...scores.entries()].sort((left, right) => right[1] - left[1]);
}

function categoryTotals(sessions: PerformanceSession[]) {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    totals.set(session.category, (totals.get(session.category) ?? 0) + 1);
  }

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category, value]) => ({ category, value }));
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

function hasCategory(sessions: PerformanceSession[], category: string) {
  return sessions.some((session) => session.category === category);
}

function metadataNumber(session: PerformanceSession, key: string) {
  const value = session.metadata[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function averageNumbers(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return round(values.reduce((total, value) => total + value, 0) / values.length);
}

function moodAverage(sessions: PerformanceSession[]) {
  return averageNumbers(
    sessions.map((session) => {
      const mood =
        metadataNumber(session, "moodAfter") ??
        metadataNumber(session, "calmLevel") ??
        metadataNumber(session, "clarity") ??
        session.intensityOrFocus;

      return clamp(mood, 1, 5);
    }),
  );
}

function monthKey(date = new Date()) {
  return toISODate(date).slice(0, 7);
}

function shiftWeekKey(weekKey: string, weeks: number) {
  const date = fromISODate(weekKey);
  date.setDate(date.getDate() + weeks * 7);
  return getWeekKey(date);
}

function buildModuleInsights(
  module: PerformanceModule,
  current: PerformanceSession[],
  previous: PerformanceSession[],
) {
  const insights: string[] = [];
  const currentTime = totalTime(current);
  const previousTime = totalTime(previous);
  const currentAverage = averageScore(current);
  const previousAverage = averageScore(previous);
  const sessionDelta = current.length - previous.length;
  const timeDelta = currentTime - previousTime;
  const scoreDelta = round(currentAverage - previousAverage);

  if (sessionDelta !== 0) {
    insights.push(
      module === "training"
        ? `Training sessions ${sessionDelta > 0 ? "increased" : "decreased"} (${formatDelta(sessionDelta)}).`
        : `Mental sessions ${sessionDelta > 0 ? "increased" : "decreased"} (${formatDelta(sessionDelta)}).`,
    );
  }

  if (timeDelta !== 0) {
    insights.push(`Total time shifted ${formatDelta(timeDelta)} min vs last week.`);
  }

  if (scoreDelta !== 0) {
    insights.push(
      module === "training"
        ? `Average intensity moved ${formatDelta(scoreDelta)} points.`
        : `Average focus moved ${formatDelta(scoreDelta)} points.`,
    );
  }

  if (insights.length === 0 && current.length > 0) {
    insights.push("Output is stable against last week.");
  }

  return insights.slice(0, 5);
}

function buildTrainingCoaching(
  current: PerformanceSession[],
  previous: PerformanceSession[],
  mentalCurrent: PerformanceSession[],
) {
  const coaching: string[] = [];
  const currentIntensity = averageScore(current);
  const previousIntensity = averageScore(previous);
  const sessionChange = percentChange(current.length, previous.length);
  const recoveryCount = mentalCurrent.filter((session) =>
    ["meditation", "breathing", "journaling"].includes(session.category),
  ).length;
  const best = dayScores(current)[0];

  if (previous.length > 0 && sessionChange <= -25) {
    coaching.push(`Training volume dropped by ${Math.abs(sessionChange)}%. Add 2 short sessions before Sunday.`);
  }

  if (currentIntensity >= 4 && recoveryCount === 0) {
    coaching.push("Intensity is high and recovery work is low. Add one 5-minute breathing or journaling session today.");
  }

  if (previous.length > 0 && currentIntensity > previousIntensity) {
    coaching.push(`Intensity increased from ${previousIntensity} to ${currentIntensity}. Keep the same loading pattern.`);
  }

  if (best) {
    coaching.push(`${weekdayShort(best[0])} is your strongest physical day. Place harder sessions there.`);
  }

  return coaching.slice(0, 3);
}

function buildMentalCoaching(current: PerformanceSession[], previous: PerformanceSession[]) {
  const coaching: string[] = [];
  const currentDays = uniqueDays(current).size;
  const previousDays = uniqueDays(previous).size;
  const consistencyChange = percentChange(currentDays, previousDays);
  const currentReading = current.filter((session) => session.category === "reading");
  const previousReading = previous.filter((session) => session.category === "reading");
  const readingFocus = averageScore(currentReading);
  const previousReadingFocus = averageScore(previousReading);
  const best = dayScores(current)[0];

  if (previousDays > 0 && consistencyChange <= -20) {
    coaching.push("Mental consistency dropped this week. Start with one simple 5-minute session today.");
  }

  if (previousReading.length > 0 && readingFocus > previousReadingFocus) {
    coaching.push(`Reading focus improved from ${previousReadingFocus} to ${readingFocus}. Keep the same routine.`);
  }

  if (!hasCategory(current, "meditation") && !hasCategory(current, "breathing")) {
    coaching.push("Recovery practice is missing. Add one breathing or meditation session today.");
  }

  if (best) {
    coaching.push(`${weekdayShort(best[0])} is your strongest cognitive day. Schedule deeper work there.`);
  }

  return coaching.slice(0, 3);
}

export function calculateModuleDashboard(
  storage: WeekStorage,
  module: PerformanceModule,
): ModuleDashboard {
  const current = moduleSessions(storage.currentWeek, module);
  const previous = moduleSessions(storage.previousWeek, module);
  const currentTime = totalTime(current);
  const previousTime = totalTime(previous);
  const currentAverage = averageScore(current);
  const previousAverage = averageScore(previous);
  const activeDays = uniqueDays(current).size;
  const rankedDays = dayScores(current);
  const trainingCurrent = moduleSessions(storage.currentWeek, "training");
  const mentalCurrent = moduleSessions(storage.currentWeek, "mental");

  return {
    module,
    totalSessions: current.length,
    totalTime: currentTime,
    averageScore: currentAverage,
    activeDays,
    consistency: Math.round((activeDays / 7) * 100),
    previousSessions: previous.length,
    previousTime,
    previousAverageScore: previousAverage,
    sessionDelta: current.length - previous.length,
    timeDelta: currentTime - previousTime,
    scoreDelta: round(currentAverage - previousAverage),
    improvementPercent: percentChange(currentTime + currentAverage * 12, previousTime + previousAverage * 12),
    bestDay: rankedDays[0]?.[0] ?? null,
    weakestDay: rankedDays.length > 0 ? rankedDays[rankedDays.length - 1][0] : null,
    categoryTotals: categoryTotals(current),
    insights: buildModuleInsights(module, current, previous),
    coaching:
      module === "training"
        ? buildTrainingCoaching(trainingCurrent, moduleSessions(storage.previousWeek, "training"), mentalCurrent)
        : buildMentalCoaching(mentalCurrent, moduleSessions(storage.previousWeek, "mental")),
  };
}

export function calculateAriseScore(storage: WeekStorage): AriseScore {
  const trainingCurrent = moduleSessions(storage.currentWeek, "training");
  const mentalCurrent = moduleSessions(storage.currentWeek, "mental");
  const trainingPrevious = moduleSessions(storage.previousWeek, "training");
  const mentalPrevious = moduleSessions(storage.previousWeek, "mental");
  const today = toISODate();
  const todaySessions = storage.currentWeek.filter((session) => session.timestamp.slice(0, 10) === today);
  const trainingVolume = totalTime(trainingCurrent) * averageScore(trainingCurrent);
  const mentalConsistency = uniqueDays(mentalCurrent).size * 18;
  const focusQuality = averageScore(mentalCurrent) * 12;
  const previousScore =
    totalTime(trainingPrevious) * averageScore(trainingPrevious) +
    uniqueDays(mentalPrevious).size * 18 +
    averageScore(mentalPrevious) * 12;
  const weeklyScore = clamp(Math.round(trainingVolume * 0.28 + mentalConsistency + focusQuality), 0, 100);
  const previousWeeklyScore = clamp(Math.round(previousScore * 0.28), 0, 100);
  const dailyScore = clamp(
    Math.round(
      todaySessions.reduce(
        (total, session) => total + session.duration * session.intensityOrFocus * (session.module === "training" ? 0.45 : 0.6),
        0,
      ),
    ),
    0,
    100,
  );
  const trainingLoad = totalTime(trainingCurrent) * averageScore(trainingCurrent);
  const mentalLoad = totalTime(mentalCurrent) * averageScore(mentalCurrent);
  const coaching: string[] = [];

  if (trainingLoad > mentalLoad * 2 && trainingCurrent.length >= 2) {
    coaching.push("Physical load is leading mental recovery. Add one short cognitive reset today.");
  }

  if (mentalLoad > trainingLoad * 2 && mentalCurrent.length >= 3) {
    coaching.push("Cognitive consistency is ahead. Add one low-friction physical session to balance the system.");
  }

  if (weeklyScore > previousWeeklyScore) {
    coaching.push("ARISE Score is trending up. Preserve the current balance through Sunday.");
  }

  return {
    dailyScore,
    weeklyScore,
    trend: weeklyScore > previousWeeklyScore ? "up" : weeklyScore < previousWeeklyScore ? "down" : "stable",
    coaching: coaching.slice(0, 2),
  };
}

export function buildWeeklySummary(weekKey: string, sessions: PerformanceSession[]): WeeklySummary {
  const training = moduleSessions(sessions, "training");
  const mental = moduleSessions(sessions, "mental");
  const ariseScore = calculateAriseScore({
    weekKey,
    currentWeek: sessions,
    previousWeek: [],
  }).weeklyScore;

  return {
    weekKey,
    monthKey: weekKey.slice(0, 7),
    training: {
      sessions: training.length,
      totalTime: totalTime(training),
      averageScore: averageScore(training),
      activeDays: uniqueDays(training).size,
      consistency: Math.round((uniqueDays(training).size / 7) * 100),
      load: round(totalTime(training) * Math.max(1, averageScore(training))),
    },
    mental: {
      sessions: mental.length,
      totalTime: totalTime(mental),
      averageScore: averageScore(mental),
      activeDays: uniqueDays(mental).size,
      consistency: Math.round((uniqueDays(mental).size / 7) * 100),
      load: round(totalTime(mental) * Math.max(1, averageScore(mental))),
      completedHabits: mental.length,
      moodAverage: moodAverage(mental),
    },
    ariseScore,
  };
}

function normalizeWeekHistory(history: WeeklySummary[]) {
  return [...history]
    .reduce<WeeklySummary[]>((accumulator, entry) => {
      if (accumulator.some((item) => item.weekKey === entry.weekKey)) {
        return accumulator.map((item) => (item.weekKey === entry.weekKey ? entry : item));
      }

      accumulator.push(entry);
      return accumulator;
    }, [])
    .sort((left, right) => left.weekKey.localeCompare(right.weekKey))
    .slice(-12);
}

function upsertWeeklySummary(history: WeeklySummary[], summary: WeeklySummary) {
  return normalizeWeekHistory([...history, summary]);
}

function buildWeekTimeline(storage: WeekStorage, history: WeeklySummary[]) {
  const timeline = normalizeWeekHistory(history);
  const currentSummary = buildWeeklySummary(storage.weekKey, storage.currentWeek);
  const previousKey = shiftWeekKey(storage.weekKey, -1);
  const previousSummary = buildWeeklySummary(previousKey, storage.previousWeek);

  return normalizeWeekHistory([
    ...timeline.filter((entry) => entry.weekKey !== currentSummary.weekKey && entry.weekKey !== previousSummary.weekKey),
    previousSummary,
    currentSummary,
  ]);
}

function aggregateMonth(weeks: WeeklySummary[]) {
  if (weeks.length === 0) {
    return {
      trainingConsistency: 0,
      mentalConsistency: 0,
      ariseScore: 0,
    };
  }

  return {
    trainingConsistency: Math.round(
      weeks.reduce((total, week) => total + week.training.consistency, 0) / weeks.length,
    ),
    mentalConsistency: Math.round(
      weeks.reduce((total, week) => total + week.mental.consistency, 0) / weeks.length,
    ),
    ariseScore: Math.round(weeks.reduce((total, week) => total + week.ariseScore, 0) / weeks.length),
  };
}

function createMetricPoint(
  label: string,
  current: number,
  previous: number,
  currentLabel: string,
  previousLabel: string,
): AnalysisMetricPoint {
  return {
    label,
    current,
    previous,
    currentLabel,
    previousLabel,
  };
}

function buildMonthlyPoints(weeks: WeeklySummary[]): MonthlyAnalysisPoint[] {
  return weeks.map((week, index) => ({
    weekKey: week.weekKey,
    label: index === weeks.length - 1 ? "This week" : formatDisplayDate(week.weekKey),
    trainingConsistency: week.training.consistency,
    mentalConsistency: week.mental.consistency,
    ariseScore: week.ariseScore,
  }));
}

function buildAnalysisInsights(
  current: WeeklySummary,
  previous: WeeklySummary,
  currentMonth: ReturnType<typeof aggregateMonth>,
  previousMonth: ReturnType<typeof aggregateMonth>,
) {
  const insights: string[] = [];
  const trainingDelta = current.training.sessions - previous.training.sessions;
  const intensityDelta = round(current.training.averageScore - previous.training.averageScore);
  const mentalDelta = current.mental.consistency - previous.mental.consistency;
  const focusDelta = round(current.mental.averageScore - previous.mental.averageScore);
  const loadTotal = current.training.load + current.mental.load;
  const physicalShare = loadTotal > 0 ? Math.round((current.training.load / loadTotal) * 100) : 50;

  if (trainingDelta > 0) {
    insights.push(`Your training volume increased compared to last week (${formatDelta(trainingDelta)} sessions).`);
  } else if (trainingDelta < 0) {
    insights.push(`Training volume fell by ${Math.abs(trainingDelta)} sessions. Add one compact session before the week closes.`);
  }

  if (intensityDelta > 0) {
    insights.push("Intensity increased this week. Keep recovery work close to the load.");
  }

  if (mentalDelta < 0) {
    insights.push("Mental consistency dropped slightly. Start with one low-friction cognitive block today.");
  } else if (focusDelta > 0) {
    insights.push(`Your focus quality improved to ${current.mental.averageScore}. Keep the same rhythm.`);
  }

  if (currentMonth.ariseScore > previousMonth.ariseScore) {
    insights.push("Monthly ARISE score is moving up. The current operating rhythm is working.");
  }

  if (physicalShare >= 65) {
    insights.push("Physical performance is the stronger area this week. Add one mental reset to rebalance the system.");
  } else if (physicalShare <= 35) {
    insights.push("Cognitive work is ahead of physical output. Add one training block to restore balance.");
  }

  return insights.slice(0, 5);
}

export function calculateAnalyseDashboard(storage: WeekStorage, history: WeeklySummary[]): AnalyseDashboard {
  const timeline = buildWeekTimeline(storage, history);
  const currentSummary = timeline[timeline.length - 1] ?? buildWeeklySummary(storage.weekKey, storage.currentWeek);
  const previousSummary =
    timeline[timeline.length - 2] ?? buildWeeklySummary(shiftWeekKey(storage.weekKey, -1), storage.previousWeek);
  const currentMonthKey = monthKey();
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = monthKey(previousMonthDate);
  const currentMonthWeeks = timeline.filter((week) => week.monthKey === currentMonthKey).slice(-4);
  const previousMonthWeeks = timeline.filter((week) => week.monthKey === previousMonthKey).slice(-4);
  const currentMonthAggregate = aggregateMonth(currentMonthWeeks);
  const previousMonthAggregate = aggregateMonth(previousMonthWeeks);
  const recentWeeks = timeline.slice(-4);
  const monthlyPoints = buildMonthlyPoints(recentWeeks);
  const bestWeek = currentMonthWeeks
    .slice()
    .sort((left, right) => right.ariseScore - left.ariseScore)[0] ?? recentWeeks.slice().sort((left, right) => right.ariseScore - left.ariseScore)[0];
  const weeklyTrainingMetrics = [
    createMetricPoint(
      "Sessions",
      currentSummary.training.sessions,
      previousSummary.training.sessions,
      String(currentSummary.training.sessions),
      String(previousSummary.training.sessions),
    ),
    createMetricPoint(
      "Total minutes",
      currentSummary.training.totalTime,
      previousSummary.training.totalTime,
      `${currentSummary.training.totalTime}m`,
      `${previousSummary.training.totalTime}m`,
    ),
    createMetricPoint(
      "Avg intensity",
      currentSummary.training.averageScore,
      previousSummary.training.averageScore,
      String(currentSummary.training.averageScore),
      String(previousSummary.training.averageScore),
    ),
  ];
  const weeklyMentalMetrics = [
    createMetricPoint(
      "Consistency",
      currentSummary.mental.consistency,
      previousSummary.mental.consistency,
      `${currentSummary.mental.consistency}%`,
      `${previousSummary.mental.consistency}%`,
    ),
    createMetricPoint(
      "Completed habits",
      currentSummary.mental.completedHabits,
      previousSummary.mental.completedHabits,
      String(currentSummary.mental.completedHabits),
      String(previousSummary.mental.completedHabits),
    ),
    createMetricPoint(
      "Mood / energy",
      currentSummary.mental.moodAverage,
      previousSummary.mental.moodAverage,
      String(currentSummary.mental.moodAverage),
      String(previousSummary.mental.moodAverage),
    ),
  ];
  const totalLoad = currentSummary.training.load + currentSummary.mental.load;
  const physicalBalance = totalLoad > 0 ? Math.round((currentSummary.training.load / totalLoad) * 100) : 50;
  const mentalBalance = 100 - physicalBalance;

  return {
    preview: {
      trainingTrend: percentChange(currentSummary.training.load, previousSummary.training.load),
      mentalTrend: percentChange(currentSummary.mental.load, previousSummary.mental.load),
      monthlyTrend: percentChange(currentMonthAggregate.ariseScore, previousMonthAggregate.ariseScore),
      scoreTrend: percentChange(currentSummary.ariseScore, previousSummary.ariseScore),
    },
    weeklyTraining: {
      totalSessions: currentSummary.training.sessions,
      totalTime: currentSummary.training.totalTime,
      averageIntensity: currentSummary.training.averageScore,
      metrics: weeklyTrainingMetrics,
    },
    weeklyMental: {
      totalSessions: currentSummary.mental.sessions,
      totalTime: currentSummary.mental.totalTime,
      averageFocus: currentSummary.mental.averageScore,
      consistency: currentSummary.mental.consistency,
      moodAverage: currentSummary.mental.moodAverage,
      metrics: weeklyMentalMetrics,
    },
    monthly: {
      points: monthlyPoints,
      bestWeekLabel: bestWeek ? formatDisplayDate(bestWeek.weekKey) : null,
      bestWeekScore: bestWeek?.ariseScore ?? 0,
      trainingTrend: percentChange(currentMonthAggregate.trainingConsistency, previousMonthAggregate.trainingConsistency),
      mentalTrend: percentChange(currentMonthAggregate.mentalConsistency, previousMonthAggregate.mentalConsistency),
      scoreTrend: percentChange(currentMonthAggregate.ariseScore, previousMonthAggregate.ariseScore),
    },
    comparison: {
      weekDelta: currentSummary.ariseScore - previousSummary.ariseScore,
      monthDelta: currentMonthAggregate.ariseScore - previousMonthAggregate.ariseScore,
      physicalBalance,
      mentalBalance,
    },
    insights: buildAnalysisInsights(currentSummary, previousSummary, currentMonthAggregate, previousMonthAggregate),
  };
}

export { formatPercent };
