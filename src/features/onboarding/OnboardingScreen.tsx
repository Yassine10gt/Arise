import { useState } from "react";
import type { FocusArea } from "../../models/performance";

interface OnboardingScreenProps {
  focusAreas: FocusArea[];
  onComplete: (input: { focusAreas: FocusArea[] }) => void;
}

const focusOptions: FocusArea[] = ["Fitness", "Focus", "Mental", "Recovery", "Knowledge"];

export function OnboardingScreen({ focusAreas, onComplete }: OnboardingScreenProps) {
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<FocusArea[]>(focusAreas);

  const toggleFocusArea = (area: FocusArea) => {
    setSelectedFocusAreas((current) =>
      current.includes(area)
        ? current.filter((entry) => entry !== area)
        : [...current, area],
    );
  };

  return (
    <main className="onboarding-screen">
      <section className="section-header">
        <div>
          <p className="eyebrow">System Setup</p>
          <h1>Calibrate ARISE.</h1>
          <p>Choose the domains that should influence your performance system.</p>
        </div>
      </section>

      <section className="premium-card setup-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Focus Areas</p>
            <h2>Primary domains</h2>
          </div>
        </div>
        <div className="choice-grid">
          {focusOptions.map((area) => (
            <button
              key={area}
              type="button"
              className={selectedFocusAreas.includes(area) ? "choice-card selected" : "choice-card"}
              onClick={() => toggleFocusArea(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="primary-button full-width"
        onClick={() => onComplete({ focusAreas: selectedFocusAreas })}
      >
        Continue
      </button>
    </main>
  );
}
