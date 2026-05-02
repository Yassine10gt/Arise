import { useEffect, useState, type FormEvent } from "react";
import { AuthLayout } from "./AuthLayout";
import { PasswordField } from "./PasswordField";

interface ResetPasswordPageProps {
  canReset: boolean;
  onSubmit: (input: { password: string }) => Promise<void>;
  onBackToLogin: () => void;
  onRequestNewReset: () => void;
}

export function ResetPasswordPage({
  canReset,
  onSubmit,
  onBackToLogin,
  onRequestNewReset,
}: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [canReset]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!canReset) {
      setError("This reset link is invalid or expired.");
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
      await onSubmit({ password });
      setSuccess("Password updated successfully. Redirecting to login...");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Reset failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Create a new secure password for ARISE.">
      {canReset ? (
        <form className="form-stack" onSubmit={submit}>
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button type="submit" className="primary-button full-width" disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset password"}
          </button>
        </form>
      ) : (
        <div className="form-stack">
          <p className="form-error">This reset link is invalid or expired.</p>
          <button type="button" className="primary-button full-width" onClick={onRequestNewReset}>
            Request a new reset link
          </button>
        </div>
      )}
      <button type="button" className="text-button auth-link" onClick={onBackToLogin}>
        Back to login
      </button>
    </AuthLayout>
  );
}
