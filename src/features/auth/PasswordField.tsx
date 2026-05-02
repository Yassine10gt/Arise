import { useState } from "react";

interface PasswordFieldProps {
  label: string;
  value: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}

export function PasswordField({ label, value, autoComplete, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <div className="password-field">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="text-button password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
