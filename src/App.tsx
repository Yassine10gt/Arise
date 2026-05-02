import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PrimaryNavigation } from "./components/PrimaryNavigation";
import { useAuth } from "./context/AuthContext";
import { AnalyseScreen } from "./features/analyse/AnalyseScreen";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { SignupPage } from "./features/auth/SignupPage";
import { HomeScreen } from "./features/home/HomeScreen";
import { MentalScreen } from "./features/mental/MentalScreen";
import { OnboardingScreen } from "./features/onboarding/OnboardingScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { TrainingScreen } from "./features/training/TrainingScreen";
import { usePerformanceStore } from "./hooks/usePerformanceStore";
import { useAppRouter } from "./hooks/useAppRouter";
import type { AppSection } from "./models/performance";
import { calculateAnalyseDashboard, calculateAriseScore, calculateModuleDashboard } from "./utils/progress";

const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"] as const;
const protectedRoutes = ["/app", "/home", "/training", "/mental", "/profile", "/analysis"] as const;

function isPublicRoute(path: string) {
  return publicRoutes.includes(path as (typeof publicRoutes)[number]);
}

function isProtectedRoute(path: string) {
  return protectedRoutes.includes(path as (typeof protectedRoutes)[number]);
}

function routeToSection(path: string): AppSection {
  if (path === "/training") {
    return "training";
  }

  if (path === "/mental") {
    return "mental";
  }

  if (path === "/profile") {
    return "profile";
  }

  return "home";
}

export default function App() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { path, navigate } = useAppRouter();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    authEvent,
    signUp,
    logIn,
    logOut,
    updateUser,
    requestPasswordReset,
    updatePassword,
  } = useAuth();

  const currentUserId = usePerformanceStore((state) => state.currentUserId);
  const onboardingCompleted = usePerformanceStore((state) => state.onboardingCompleted);
  const profile = usePerformanceStore((state) => state.profile);
  const weekStorage = usePerformanceStore((state) => state.weekStorage);
  const weekHistory = usePerformanceStore((state) => state.weekHistory);
  const customMentalModules = usePerformanceStore((state) => state.customMentalModules);
  const setCurrentUser = usePerformanceStore((state) => state.setCurrentUser);
  const completeOnboarding = usePerformanceStore((state) => state.completeOnboarding);
  const ensureCurrentWeek = usePerformanceStore((state) => state.ensureCurrentWeek);
  const addSession = usePerformanceStore((state) => state.addSession);
  const addCustomMentalModule = usePerformanceStore((state) => state.addCustomMentalModule);
  const updateProfile = usePerformanceStore((state) => state.updateProfile);

  const trainingDashboard = useMemo(() => calculateModuleDashboard(weekStorage, "training"), [weekStorage]);
  const mentalDashboard = useMemo(() => calculateModuleDashboard(weekStorage, "mental"), [weekStorage]);
  const ariseScore = useMemo(() => calculateAriseScore(weekStorage), [weekStorage]);
  const analysisDashboard = useMemo(() => calculateAnalyseDashboard(weekStorage, weekHistory), [weekHistory, weekStorage]);
  const activeSection = routeToSection(path);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
    document.documentElement.dataset.level = String(Math.min(5, Math.max(1, Math.ceil(ariseScore.weeklyScore / 20))));
  }, [ariseScore.weeklyScore, profile.theme]);

  useEffect(() => {
    setCurrentUser(user?.id ?? null);
  }, [setCurrentUser, user?.id]);

  useEffect(() => {
    if (isAuthenticated && onboardingCompleted) {
      ensureCurrentWeek();
    }
  }, [ensureCurrentWeek, isAuthenticated, onboardingCompleted]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  if (isAuthLoading) {
    return (
      <div className="app-shell auth-app-shell">
        <main className="auth-shell auth-shell-loading">
          <section className="auth-panel premium-card strong">
            <div className="auth-panel-header">
              <p className="eyebrow">ARISE</p>
              <h2>Loading secure session...</h2>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (user && currentUserId !== user.id) {
    return (
      <div className="app-shell auth-app-shell">
        <main className="auth-shell auth-shell-loading">
          <section className="auth-panel premium-card strong">
            <div className="auth-panel-header">
              <p className="eyebrow">ARISE</p>
              <h2>Preparing your workspace...</h2>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (path === "/") {
    navigate(isAuthenticated ? "/app" : "/login", { replace: true });
    return null;
  }

  if (isAuthenticated && isPublicRoute(path) && !(path === "/reset-password" && authEvent === "PASSWORD_RECOVERY")) {
    navigate("/app", { replace: true });
    return null;
  }

  if (!isAuthenticated && isProtectedRoute(path)) {
    navigate("/login", { replace: true });
    return null;
  }

  if (!isPublicRoute(path) && !isProtectedRoute(path)) {
    navigate(isAuthenticated ? "/app" : "/login", { replace: true });
    return null;
  }

  const renderProtectedSection = () => {
    if (!user) {
      return null;
    }

    if (!onboardingCompleted) {
      return (
        <OnboardingScreen
          focusAreas={profile.focusAreas}
          onComplete={(input) => {
            completeOnboarding(input);
            setFeedback("System calibrated.");
            navigate("/app", { replace: true });
          }}
        />
      );
    }

    if (path === "/training") {
      return (
        <TrainingScreen
          dashboard={trainingDashboard}
          sessions={weekStorage.currentWeek}
          onSave={(session) => {
            addSession(session);
            setFeedback("Training session saved.");
          }}
        />
      );
    }

    if (path === "/mental") {
      return (
        <MentalScreen
          dashboard={mentalDashboard}
          sessions={weekStorage.currentWeek}
          customModules={customMentalModules}
          onSave={(session) => {
            addSession(session);
            setFeedback("Mental session saved.");
          }}
          onAddCustomModule={addCustomMentalModule}
        />
      );
    }

    if (path === "/profile") {
      return (
        <ProfileScreen
          user={user}
          profile={profile}
          ariseScore={ariseScore}
          onUpdateUser={(input) => {
            void updateUser(input)
              .then(() => setFeedback("Account details updated."))
              .catch((error) => setFeedback(error instanceof Error ? error.message : "Account update failed."));
          }}
          onUpdateProfile={updateProfile}
          onLogOut={() => {
            logOut();
            navigate("/login", { replace: true });
          }}
        />
      );
    }

    if (path === "/analysis") {
      return <AnalyseScreen analysis={analysisDashboard} score={ariseScore} onBack={() => navigate("/home")} />;
    }

    return (
      <HomeScreen
        score={ariseScore}
        training={trainingDashboard}
        mental={mentalDashboard}
        analysis={analysisDashboard}
        profile={profile}
        onNavigate={(section) => navigate(section === "home" ? "/home" : `/${section}`)}
        onOpenAnalysis={() => navigate("/analysis")}
      />
    );
  };

  const renderPublicRoute = () => {
    if (path === "/login") {
      return (
        <LoginPage
          onSubmit={async ({ email, password }) => {
            await logIn(email, password);
            navigate("/app", { replace: true });
          }}
          onForgotPassword={() => navigate("/forgot-password")}
          onCreateAccount={() => navigate("/signup")}
        />
      );
    }

    if (path === "/signup") {
      return (
        <SignupPage
          onSubmit={async (input) => {
            const result = await signUp(input);
            if (!result.requiresEmailConfirmation) {
              navigate("/app", { replace: true });
            }
            return result;
          }}
          onLogIn={() => navigate("/login")}
        />
      );
    }

    if (path === "/forgot-password") {
      return (
        <ForgotPasswordPage
          onSubmit={async (email) => {
            await requestPasswordReset(email, `${origin}/reset-password`);
          }}
          onBackToLogin={() => navigate("/login")}
        />
      );
    }

    return (
      <ResetPasswordPage
        canReset={isAuthenticated || authEvent === "PASSWORD_RECOVERY"}
        onSubmit={async ({ password }) => {
          await updatePassword(password);
          setFeedback("Password updated.");
          logOut();
          window.setTimeout(() => navigate("/login", { replace: true }), 1200);
        }}
        onBackToLogin={() => navigate("/login")}
        onRequestNewReset={() => navigate("/forgot-password", { replace: true })}
      />
    );
  };

  if (isPublicRoute(path)) {
    return (
      <div className="app-shell auth-app-shell">
        {feedback ? <aside className="feedback-banner">{feedback}</aside> : null}
        {renderPublicRoute()}
      </div>
    );
  }

  return (
    <ProtectedRoute isAllowed={isAuthenticated} redirectTo="/login" navigate={navigate}>
      <div className="app-shell">
        <div className={`app-frame section-${path.replace("/", "") || "home"}`}>
          {feedback ? <aside className="feedback-banner">{feedback}</aside> : null}
          <main className="app-content">{renderProtectedSection()}</main>
          {onboardingCompleted ? (
            <PrimaryNavigation
              activeSection={path === "/analysis" ? "home" : activeSection}
              onChange={(section) => navigate(section === "home" ? "/home" : `/${section}`)}
            />
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
