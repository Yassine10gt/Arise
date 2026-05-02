import type { AppSection } from "../models/performance";

interface PrimaryNavigationProps {
  activeSection: AppSection;
  onChange: (section: AppSection) => void;
}

const navigationItems: Array<{ id: AppSection; label: string }> = [
  { id: "home", label: "Home" },
  { id: "training", label: "Training" },
  { id: "mental", label: "Mental" },
  { id: "profile", label: "Profile" },
];

export function PrimaryNavigation({ activeSection, onChange }: PrimaryNavigationProps) {
  return (
    <nav className="primary-navigation" aria-label="Primary navigation">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === activeSection ? "nav-item active" : "nav-item"}
          aria-current={item.id === activeSection ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
