import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  tone?: "default" | "strong" | "soft";
}

export function PremiumCard({ children, className = "", tone = "default" }: PremiumCardProps) {
  return <section className={`premium-card ${tone} ${className}`.trim()}>{children}</section>;
}
