import { useState, type FormEvent } from "react";
import { AuthLayout } from "./AuthLayout";

interface ForgotPasswordPageProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({
  onSubmit,
  onBackToLogin,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(email.trim());
      setConfirmation("Password reset instructions have been sent if this email exists.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to process this request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Recover access without breaking the flow.">
      <form className="form-stack" onSubmit={submit}>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {confirmation ? <p className="form-success">{confirmation}</p> : null}
        <button type="submit" className="primary-button full-width" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset instructions"}
        </button>
      </form>
      <button type="button" className="text-button auth-link" onClick={onBackToLogin}>
        Back to login
      </button>
    </AuthLayout>
  );
}
