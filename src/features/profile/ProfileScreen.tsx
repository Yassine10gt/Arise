import { useEffect, useState } from "react";
import type { AriseScore, AriseUser, FocusArea, UserProfile } from "../../models/performance";
import { formatDisplayDate } from "../../utils/date";

interface ProfileScreenProps {
  user: AriseUser;
  profile: UserProfile;
  ariseScore: AriseScore;
  onUpdateUser: (user: Partial<Pick<AriseUser, "name" | "email">>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onLogOut: () => void;
}

const focusAreas: FocusArea[] = ["Fitness", "Focus", "Mental", "Recovery", "Knowledge"];

export function ProfileScreen({
  user,
  profile,
  ariseScore,
  onUpdateUser,
  onUpdateProfile,
  onLogOut,
}: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setAccountError("");
  }, [user.email, user.name]);

  const toggleFocusArea = (area: FocusArea) => {
    const nextFocusAreas = profile.focusAreas.includes(area)
      ? profile.focusAreas.filter((entry) => entry !== area)
      : [...profile.focusAreas, area];

    onUpdateProfile({ focusAreas: nextFocusAreas });
  };

  return (
    <div className="screen-stack profile-screen">
      <header className="section-header compact-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user.name}</h1>
          <p>Started {formatDisplayDate(user.createdAt)}</p>
        </div>
      </header>

      <section className="premium-card profile-overview">
        <div>
          <p className="eyebrow">ARISE</p>
          <h2>Personal performance operating system</h2>
          <p>Weekly score {ariseScore.weeklyScore} / Daily score {ariseScore.dailyScore}</p>
        </div>
      </section>

      <section className="premium-card settings-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Account</p>
            <h2>Local profile</h2>
          </div>
        </div>
        <div className="form-grid two">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="secondary-button compact"
          onClick={() => {
            try {
              onUpdateUser({ name, email });
              setAccountError("");
            } catch (error) {
              setAccountError(error instanceof Error ? error.message : "Could not update account details.");
            }
          }}
        >
          Save account details
        </button>
        {accountError ? <p className="form-error">{accountError}</p> : null}
      </section>

      <section className="premium-card settings-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Focus Areas</p>
            <h2>System emphasis</h2>
          </div>
        </div>
        <div className="choice-grid">
          {focusAreas.map((area) => (
            <button
              key={area}
              type="button"
              className={profile.focusAreas.includes(area) ? "choice-card selected" : "choice-card"}
              onClick={() => toggleFocusArea(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      <section className="premium-card settings-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Targets</p>
            <h2>Weekly operating range</h2>
          </div>
        </div>
        <div className="form-grid two">
          <label>
            Training
            <input
              type="number"
              min="1"
              value={profile.weeklyTrainingTarget}
              onChange={(event) => onUpdateProfile({ weeklyTrainingTarget: Number(event.target.value) })}
            />
          </label>
          <label>
            Mental
            <input
              type="number"
              min="1"
              value={profile.weeklyMentalTarget}
              onChange={(event) => onUpdateProfile({ weeklyMentalTarget: Number(event.target.value) })}
            />
          </label>
        </div>
        <div className="theme-choice">
          <span>Theme</span>
          <button
            type="button"
            className={profile.theme === "dark" ? "active" : ""}
            onClick={() => onUpdateProfile({ theme: "dark" })}
          >
            Dark
          </button>
          <button
            type="button"
            className={profile.theme === "light" ? "active" : ""}
            onClick={() => onUpdateProfile({ theme: "light" })}
          >
            Light
          </button>
        </div>
      </section>

      <button type="button" className="secondary-button full-width" onClick={onLogOut}>
        Log out
      </button>
    </div>
  );
}
