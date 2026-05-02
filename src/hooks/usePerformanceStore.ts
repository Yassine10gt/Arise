import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CustomMentalModule,
  FocusArea,
  PerformanceSession,
  PerformanceUserRecord,
  SessionMetadata,
  UserProfile,
  WeeklySummary,
} from "../models/performance";
import { createId, createWeekStorage, rolloverWeekStorage } from "../utils/progress";

const initialProfile: UserProfile = {
  focusAreas: ["Fitness", "Focus", "Mental"],
  theme: "dark",
  weeklyTrainingTarget: 4,
  weeklyMentalTarget: 5,
};

function createEmptyRecord(): PerformanceUserRecord {
  return {
    onboardingCompleted: false,
    profile: initialProfile,
    weekStorage: createWeekStorage(),
    weekHistory: [],
    customMentalModules: [],
  };
}

interface OnboardingInput {
  focusAreas: FocusArea[];
}

interface SessionInput {
  module: PerformanceSession["module"];
  category: PerformanceSession["category"];
  duration: number;
  intensityOrFocus: number;
  metadata: SessionMetadata;
  notes?: string;
}

interface PerformanceStore {
  currentUserId: string | null;
  recordsByUserId: Record<string, PerformanceUserRecord>;
  onboardingCompleted: boolean;
  profile: UserProfile;
  weekStorage: PerformanceUserRecord["weekStorage"];
  weekHistory: WeeklySummary[];
  customMentalModules: CustomMentalModule[];
  setCurrentUser: (userId: string | null) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  ensureCurrentWeek: () => void;
  addSession: (input: SessionInput) => PerformanceSession;
  addCustomMentalModule: (input: Omit<CustomMentalModule, "id">) => CustomMentalModule;
}

function syncRecord(state: PerformanceStore, nextRecord: PerformanceUserRecord) {
  if (!state.currentUserId) {
    return {
      onboardingCompleted: nextRecord.onboardingCompleted,
      profile: nextRecord.profile,
      weekStorage: nextRecord.weekStorage,
      weekHistory: nextRecord.weekHistory,
      customMentalModules: nextRecord.customMentalModules,
    };
  }

  return {
    recordsByUserId: {
      ...state.recordsByUserId,
      [state.currentUserId]: nextRecord,
    },
    onboardingCompleted: nextRecord.onboardingCompleted,
    profile: nextRecord.profile,
    weekStorage: nextRecord.weekStorage,
    weekHistory: nextRecord.weekHistory,
    customMentalModules: nextRecord.customMentalModules,
  };
}

export const usePerformanceStore = create<PerformanceStore>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      recordsByUserId: {},
      onboardingCompleted: false,
      profile: initialProfile,
      weekStorage: createWeekStorage(),
      weekHistory: [],
      customMentalModules: [],
      setCurrentUser: (userId) => {
        const state = get();
        const record = userId ? (state.recordsByUserId[userId] ?? createEmptyRecord()) : createEmptyRecord();

        set((current) => ({
          currentUserId: userId,
          ...(userId && !current.recordsByUserId[userId]
            ? {
                recordsByUserId: {
                  ...current.recordsByUserId,
                  [userId]: record,
                },
              }
            : {}),
          onboardingCompleted: record.onboardingCompleted,
          profile: record.profile,
          weekStorage: record.weekStorage,
          weekHistory: record.weekHistory,
          customMentalModules: record.customMentalModules,
        }));
      },
      completeOnboarding: (input) => {
        set((state) => {
          const next = rolloverWeekStorage(state.weekStorage, state.weekHistory);
          const nextRecord: PerformanceUserRecord = {
            onboardingCompleted: true,
            profile: {
              ...state.profile,
              focusAreas: input.focusAreas.length ? input.focusAreas : state.profile.focusAreas,
            },
            weekStorage: next.weekStorage,
            weekHistory: next.weekHistory,
            customMentalModules: state.customMentalModules,
          };

          return syncRecord(state, nextRecord);
        });
      },
      updateProfile: (profile) => {
        set((state) => {
          const nextRecord: PerformanceUserRecord = {
            onboardingCompleted: state.onboardingCompleted,
            profile: {
              ...state.profile,
              ...profile,
            },
            weekStorage: state.weekStorage,
            weekHistory: state.weekHistory,
            customMentalModules: state.customMentalModules,
          };

          return syncRecord(state, nextRecord);
        });
      },
      ensureCurrentWeek: () => {
        set((state) => {
          const next = rolloverWeekStorage(state.weekStorage, state.weekHistory);
          const nextRecord: PerformanceUserRecord = {
            onboardingCompleted: state.onboardingCompleted,
            profile: state.profile,
            weekStorage: next.weekStorage,
            weekHistory: next.weekHistory,
            customMentalModules: state.customMentalModules,
          };

          return syncRecord(state, nextRecord);
        });
      },
      addSession: (input) => {
        const session: PerformanceSession = {
          id: createId(input.module),
          module: input.module,
          category: input.category,
          timestamp: new Date().toISOString(),
          duration: Math.max(0, Math.round(input.duration)),
          intensityOrFocus: Math.min(5, Math.max(1, input.intensityOrFocus)),
          metadata: input.metadata,
          notes: input.notes?.trim() ?? "",
        };

        set((state) => {
          const next = rolloverWeekStorage(state.weekStorage, state.weekHistory);
          const nextRecord: PerformanceUserRecord = {
            onboardingCompleted: state.onboardingCompleted,
            profile: state.profile,
            weekStorage: {
              ...next.weekStorage,
              currentWeek: [session, ...next.weekStorage.currentWeek],
            },
            weekHistory: next.weekHistory,
            customMentalModules: state.customMentalModules,
          };

          return syncRecord(state, nextRecord);
        });

        return session;
      },
      addCustomMentalModule: (input) => {
        const module: CustomMentalModule = {
          id: createId("mental-module"),
          name: input.name.trim(),
          metricType: input.metricType,
          notes: input.notes?.trim(),
        };

        if (!module.name) {
          return module;
        }

        set((state) => {
          const nextRecord: PerformanceUserRecord = {
            onboardingCompleted: state.onboardingCompleted,
            profile: state.profile,
            weekStorage: state.weekStorage,
            weekHistory: state.weekHistory,
            customMentalModules: [module, ...state.customMentalModules],
          };

          return syncRecord(state, nextRecord);
        });

        return module;
      },
    }),
    {
      name: "arise-performance-system-v4",
      partialize: (state) => ({
        recordsByUserId: state.recordsByUserId,
      }),
    },
  ),
);
