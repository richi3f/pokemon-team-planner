"use client";

import { useState } from "react";
import type { TypeAnalysisResult, TypeChart } from "@/lib/types";
import { capitalize } from "@/lib/utils/string";
import {
  getCoverageScore,
  getDefenseScore,
} from "@/lib/utils/team-analysis";

interface TypeAnalysisProps {
  typeChart: TypeChart;
  analysis: TypeAnalysisResult;
  hidden: boolean;
  note?: React.ReactNode;
}

export function TypeAnalysis({
  typeChart,
  analysis,
  hidden,
  note,
}: TypeAnalysisProps) {
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);

  return (
    <div
      className={
        "team__type-analysis" +
        (hidden ? " type-analysis_hidden" : "")
      }
    >
      <h3 className="type-analysis__heading">Team Defense</h3>
      <TypeGrid
        typeChart={typeChart}
        analysis={analysis}
        mode="defense"
        highlightSlug={highlightSlug}
        onHighlight={setHighlightSlug}
      />
      <h3 className="type-analysis__heading">Coverage</h3>
      <TypeGrid
        typeChart={typeChart}
        analysis={analysis}
        mode="coverage"
        highlightSlug={highlightSlug}
        onHighlight={setHighlightSlug}
      />
      {note}
    </div>
  );
}

function TypeGrid({
  typeChart,
  analysis,
  mode,
  highlightSlug,
  onHighlight,
}: {
  typeChart: TypeChart;
  analysis: TypeAnalysisResult;
  mode: "defense" | "coverage";
  highlightSlug: string | null;
  onHighlight: (slug: string | null) => void;
}) {
  return (
    <ol
      className={
        "type-analysis__grid " +
        (mode === "defense"
          ? "type-analysis__grid_defense"
          : "type-analysis__grid_attack")
      }
    >
      {Object.keys(typeChart).map((type) => {
        const counts = analysis[type];
        const defScore = getDefenseScore(counts);
        const atkScore = getCoverageScore(counts);
        const warning =
          mode === "defense"
            ? defScore < 0
            : defScore + atkScore < 0;

        const marks =
          mode === "defense"
            ? buildDefenseMarks(counts)
            : buildCoverageMarks(counts);

        return (
          <li
            key={type}
            className={"tally tally_" + type + (warning ? " tally_warning" : "")}
          >
            <span className="tally__type-symbol" title={capitalize(type)}>
              {capitalize(type)}
            </span>
            <ol className="tally__marks">
              {marks.map((mark, i) => (
                <li
                  key={i}
                  className={
                    "tally__mark" +
                    (mark.value > 0
                      ? " tally__mark_positive"
                      : mark.value < 0
                        ? " tally__mark_negative"
                        : "")
                  }
                  data-slug={mark.slug}
                  onMouseEnter={() =>
                    mark.slug ? onHighlight(mark.slug) : undefined
                  }
                  onMouseLeave={() => onHighlight(null)}
                >
                  {mark.value}
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

function buildDefenseMarks(counts: {
  weak: string[];
  resist: string[];
}) {
  const weak = [...counts.weak];
  const resist = [...counts.resist];
  const marks: { value: number; slug: string }[] = [];

  for (let i = 0; i < 6; i++) {
    if (weak.length) {
      marks.push({ value: -1, slug: weak.shift()! });
    } else if (resist.length) {
      marks.push({ value: 1, slug: resist.shift()! });
    } else {
      marks.push({ value: 0, slug: "" });
    }
  }
  return marks;
}

function buildCoverageMarks(counts: { coverage: string[] }) {
  const cov = [...counts.coverage];
  const marks: { value: number; slug: string }[] = [];

  for (let i = 0; i < 6; i++) {
    if (cov.length) {
      marks.push({ value: 1, slug: cov.shift()! });
    } else {
      marks.push({ value: 0, slug: "" });
    }
  }
  return marks;
}
