import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AriseUser } from "../models/performance";
import { supabase, supabaseConfig } from "../services/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AriseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authEvent: string | null;
  signUp: (input: SignUpInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
  updateUser: (input: Partial<Pick<AriseUser, "name" | "email">>) => Promise<AriseUser>;
  requestPasswordReset: (email: string, redirectTo: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(user: User): AriseUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nameFromMetadata = typeof metadata.full_name === "string" ? (metadata.full_name as string) : "";
  return {
    id: user.id,
    name: nameFromMetadata || "ARISE User",
    email: user.email ?? "",
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AriseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [authEvent, setAuthEvent] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfig.isConfigured || !supabase) {
      setConfigError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let active = true;

    const init = async () => {
      const { data } = await client.auth.getSession();
      if (!active) {
        return;
      }

      const session = data.session ?? null;
      const sessionUser = session?.user ?? null;
      setUser(sessionUser ? mapSupabaseUser(sessionUser) : null);
      setIsLoading(false);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[ARISE][auth] env:", {
          mode: import.meta.env.MODE,
          configured: supabaseConfig.isConfigured,
          hasUrl: Boolean(supabaseConfig.url),
          hasAnonKey: Boolean(supabaseConfig.anonKey),
          startupSession: Boolean(session),
        });
      }
    };

    void init();

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      setAuthEvent(event);
      const sessionUser = session?.user ?? null;
      setUser(sessionUser ? mapSupabaseUser(sessionUser) : null);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[ARISE][auth] state:", { event, hasSession: Boolean(session) });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authEvent,
      signUp: async (input) => {
        if (!supabase) {
          throw new Error(configError ?? "Supabase is not configured.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: input.email.trim(),
          password: input.password.trim(),
          options: {
            data: {
              full_name: input.name,
            },
          },
        });

        if (error) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("[ARISE][auth] signup error:", error);
          }
          throw error;
        }

        // If email confirmation is enabled, there will be no session here.
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser ? mapSupabaseUser(sessionUser) : null);

        return { requiresEmailConfirmation: !data.session };
      },
      logIn: async (email, password) => {
        if (!supabase) {
          throw new Error(configError ?? "Supabase is not configured.");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("[ARISE][auth] login error:", error);
          }

          const code = (error as { code?: string }).code ?? "";
          const message = error.message.toLowerCase();

          if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
            throw new Error("Please confirm your email first.");
          }

          if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
            throw new Error("Wrong email or password.");
          }

          if (code.includes("rate_limit") || message.includes("rate limit") || message.includes("too many")) {
            throw new Error("Too many attempts. Please wait and try again.");
          }

          throw new Error("Login failed. Please try again.");
        }

        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser ? mapSupabaseUser(sessionUser) : null);
      },
      logOut: () => {
        if (supabase) {
          void supabase.auth.signOut();
        }
        setUser(null);
      },
      updateUser: async (input) => {
        if (!supabase) {
          throw new Error(configError ?? "Supabase is not configured.");
        }
        if (!user) {
          throw new Error("Cannot update user without an active session.");
        }

        const payload: Record<string, unknown> = {};
        if (typeof input.name === "string") {
          payload.full_name = input.name;
        }

        const { data, error } = await supabase.auth.updateUser({
          email: input.email,
          data: payload,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error("Update did not return a user.");
        }

        const nextUser = mapSupabaseUser(data.user);
        setUser(nextUser);
        return nextUser;
      },
      requestPasswordReset: async (email, redirectTo) => {
        if (!supabase) {
          throw new Error(configError ?? "Supabase is not configured.");
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("[ARISE][auth] forgot-password error:", error);
          }
          throw error;
        }
      },
      updatePassword: async (password) => {
        if (!supabase) {
          throw new Error(configError ?? "Supabase is not configured.");
        }
        const { error } = await supabase.auth.updateUser({ password: password.trim() });
        if (error) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("[ARISE][auth] update-password error:", error);
          }
          throw error;
        }
      },
    }),
    [authEvent, configError, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
