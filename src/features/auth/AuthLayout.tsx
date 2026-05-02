import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand-copy">
          <p className="eyebrow">Personal Performance System</p>
          <h1>ARISE</h1>
          <p>Structured performance for body and mind.</p>
        </div>
      </section>

      <section className="auth-panel premium-card strong">
        <div className="auth-panel-header">
          <p className="eyebrow">ARISE Access</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </main>
  );
}
