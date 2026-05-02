import { useState, type FormEvent } from "react";
import { AuthLayout } from "./AuthLayout";
import { PasswordField } from "./PasswordField";

interface SignupPageProps {
  onSubmit: (input: { name: string; email: string; password: string }) => Promise<{ requiresEmailConfirmation: boolean }>;
  onLogIn: () => void;
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function SignupPage({ onSubmit, onLogIn }: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.requiresEmailConfirmation) {
        setSuccess("Check your email to confirm your account before logging in.");
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Set up secure access to your ARISE system.">
      <form className="form-stack" onSubmit={submit}>
        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
        <button type="submit" className="primary-button full-width" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <button type="button" className="secondary-button full-width" onClick={onLogIn} disabled={isLoading}>
        Back to login
      </button>
    </AuthLayout>
  );
}
