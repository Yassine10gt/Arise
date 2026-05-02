import { useState, type FormEvent } from "react";
import { AuthLayout } from "./AuthLayout";
import { PasswordField } from "./PasswordField";

interface LoginPageProps {
  onSubmit: (input: { email: string; password: string }) => Promise<void>;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}

export function LoginPage({ onSubmit, onForgotPassword, onCreateAccount }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        email: email.trim(),
        password,
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Continue into your performance system.">
      <form className="form-stack" onSubmit={submit}>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-button full-width" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <button type="button" className="text-button auth-link" onClick={onForgotPassword}>
          Forgot password?
        </button>
      </form>
      <button type="button" className="secondary-button full-width" onClick={onCreateAccount} disabled={isLoading}>
        Create account
      </button>
    </AuthLayout>
  );
}
