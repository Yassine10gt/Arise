export type AppSection = "home" | "training" | "mental" | "profile";
export type AppPage = AppSection | "analysis";

export type ThemeMode = "dark" | "light";

export type FocusArea = "Fitness" | "Focus" | "Mental" | "Recovery" | "Knowledge";

export type PerformanceModule = "training" | "mental";

export type TrainingCategory =
  | "gym"
  | "running"
  | "tennis"
  | "padel"
  | "football"
  | "boxing"
  | "swimming"
  | "custom";

export type MentalCategory =
  | "reading"
  | "meditation"
  | "breathing"
  | "gratitude"
  | "journaling"
  | "custom";

export type SessionCategory = TrainingCategory | MentalCategory | string;

export type SessionMetadata = Record<string, string | number | boolean | undefined>;

export interface PerformanceSession {
  id: string;
  module: PerformanceModule;
  category: SessionCategory;
  timestamp: string;
  duration: number;
  intensityOrFocus: number;
  metadata: SessionMetadata;
  notes: string;
}

export interface WeekStorage {
  weekKey: string;
  currentWeek: PerformanceSession[];
  previousWeek: PerformanceSession[];
}

export interface AriseUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  focusAreas: FocusArea[];
  theme: ThemeMode;
  weeklyTrainingTarget: number;
  weeklyMentalTarget: number;
}

export interface CustomMentalModule {
  id: string;
  name: string;
  metricType: "time" | "count" | "scale";
  notes?: string;
}

export interface PerformanceUserRecord {
  onboardingCompleted: boolean;
  profile: UserProfile;
  weekStorage: WeekStorage;
  weekHistory: WeeklySummary[];
  customMentalModules: CustomMentalModule[];
}

export interface ModuleDashboard {
  module: PerformanceModule;
  totalSessions: number;
  totalTime: number;
  averageScore: number;
  activeDays: number;
  consistency: number;
  previousSessions: number;
  previousTime: number;
  previousAverageScore: number;
  sessionDelta: number;
  timeDelta: number;
  scoreDelta: number;
  improvementPercent: number;
  bestDay: string | null;
  weakestDay: string | null;
  categoryTotals: Array<{ category: string; value: number }>;
  insights: string[];
  coaching: string[];
}

export interface AriseScore {
  dailyScore: number;
  weeklyScore: number;
  trend: "up" | "down" | "stable";
  coaching: string[];
}

export interface WeeklySummaryModule {
  sessions: number;
  totalTime: number;
  averageScore: number;
  activeDays: number;
  consistency: number;
  load: number;
}

export interface WeeklySummaryMental extends WeeklySummaryModule {
  completedHabits: number;
  moodAverage: number;
}

export interface WeeklySummary {
  weekKey: string;
  monthKey: string;
  training: WeeklySummaryModule;
  mental: WeeklySummaryMental;
  ariseScore: number;
}

export interface AnalysisMetricPoint {
  label: string;
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
}

export interface MonthlyAnalysisPoint {
  weekKey: string;
  label: string;
  trainingConsistency: number;
  mentalConsistency: number;
  ariseScore: number;
}

export interface AnalyseDashboard {
  preview: {
    trainingTrend: number;
    mentalTrend: number;
    monthlyTrend: number;
    scoreTrend: number;
  };
  weeklyTraining: {
    totalSessions: number;
    totalTime: number;
    averageIntensity: number;
    metrics: AnalysisMetricPoint[];
  };
  weeklyMental: {
    totalSessions: number;
    totalTime: number;
    averageFocus: number;
    consistency: number;
    moodAverage: number;
    metrics: AnalysisMetricPoint[];
  };
  monthly: {
    points: MonthlyAnalysisPoint[];
    bestWeekLabel: string | null;
    bestWeekScore: number;
    trainingTrend: number;
    mentalTrend: number;
    scoreTrend: number;
  };
  comparison: {
    weekDelta: number;
    monthDelta: number;
    physicalBalance: number;
    mentalBalance: number;
  };
  insights: string[];
}
