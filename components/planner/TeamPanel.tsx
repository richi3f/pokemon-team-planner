"use client";

import type { TeamPlannerState } from "@/hooks/useTeamPlanner";
import { TeamSlot } from "@/components/planner/TeamSlot";
import { TypeAnalysis } from "@/components/planner/TypeAnalysis";

interface TeamPanelProps {
  planner: TeamPlannerState;
}

export function TeamPanel({ planner }: TeamPanelProps) {
  const {
    slots,
    game,
    typeChart,
    analysisOpen,
    setAnalysisOpen,
    activeTeraSlot,
    setActiveTeraSlot,
    removeFromTeam,
    updateSlot,
    randomizeTeam,
    teamAnalysis,
  } = planner;

  return (
    <div className="head__team">
      <section className="team">
        <h2 className="team__heading">Your Team</h2>
        <ul className="team__slots">
          {slots.map((slot, index) => (
            <TeamSlot
              key={index}
              slot={slot}
              index={index}
              game={game}
              typeChart={typeChart}
              teraOpen={activeTeraSlot === index}
              onRemove={() => removeFromTeam(index)}
              onToggleFemale={() =>
                updateSlot(index, { female: !slot.female })
              }
              onToggleShiny={() =>
                updateSlot(index, { shiny: !slot.shiny })
              }
              onTeraToggle={() =>
                setActiveTeraSlot(activeTeraSlot === index ? null : index)
              }
              onTeraSelect={(tera) => {
                updateSlot(index, { tera });
                setActiveTeraSlot(null);
              }}
              onTeraReset={() => updateSlot(index, { tera: "" })}
            />
          ))}
        </ul>
        <div className="team__buttons">
          <button
            type="button"
            className="team__button"
            onClick={randomizeTeam}
          >
            Randomize Team
          </button>
          <button
            type="button"
            className="team__button"
            onClick={() => setAnalysisOpen(!analysisOpen)}
          >
            {analysisOpen ? "Hide Team Analysis" : "Show Team Analysis"}
          </button>
        </div>
        <TypeAnalysis
          typeChart={typeChart}
          analysis={teamAnalysis}
          hidden={!analysisOpen}
          note={
            <p className="type-analysis__note">
              Blue tally marks indicate resistances, immunities, or{" "}
              <abbr title="Same-Type Attack Bonus">STAB</abbr> coverage. Red
              tally marks indicate weakness.
            </p>
          }
        />
      </section>
    </div>
  );
}
