import { useState, type FormEvent } from "react";

export type AuthMode = "start" | "signup" | "login";

interface AuthScreenProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSignUp: (input: { name: string; email: string; password: string }) => void;
  onLogIn: (email: string, password: string) => boolean;
}

export function AuthScreen({ mode, onModeChange, onSignUp, onLogIn }: AuthScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitSignUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    onSignUp({ name, email, password });
  };

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = onLogIn(email, password);

    if (!success) {
      setError("No matching local account found.");
    }
  };

  if (mode === "start") {
    return (
      <main className="entry-screen">
        <section className="brand-panel">
          <p className="eyebrow">Personal Performance System</p>
          <h1>ARISE</h1>
          <p>
            A private operating system for physical and cognitive performance.
          </p>
        </section>

        <section className="entry-actions" aria-label="Account actions">
          <button type="button" className="primary-button full-width" onClick={() => onModeChange("signup")}>
            Create account
          </button>
          <button type="button" className="secondary-button full-width" onClick={() => onModeChange("login")}>
            Log in
          </button>
        </section>
      </main>
    );
  }

  const isSignup = mode === "signup";

  return (
    <main className="entry-screen">
      <section className="auth-panel premium-card strong">
        <button type="button" className="text-button" onClick={() => onModeChange("start")}>
          Back
        </button>
        <div>
          <p className="eyebrow">ARISE</p>
          <h1>{isSignup ? "Create account" : "Log in"}</h1>
        </div>

        <form className="form-stack" onSubmit={isSignup ? submitSignUp : submitLogin}>
          {isSignup ? (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          ) : null}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button full-width">
            {isSignup ? "Create account" : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}
