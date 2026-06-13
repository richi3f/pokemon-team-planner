"use client";

import { getPokemonRenderUrl } from "@/lib/utils/pokemon";
import type { DexListEntry } from "@/lib/planner/dex-list";

interface DexPickerProps {
  sections: {
    slug: string;
    name: string;
    entries: DexListEntry[];
  }[];
  pickedSlugs: Set<string>;
  onPick: (slug: string) => void;
}

export function DexPicker({ sections, pickedSlugs, onPick }: DexPickerProps) {
  return (
    <ol className="picker__pokedexes">
      {sections.map((section) => {
        const displayEntries = section.entries.filter(
          (e) => !pickedSlugs.has(e.slug),
        );
        if (displayEntries.length === 0) return null;

        return (
          <li
            key={section.slug}
            className="picker__pokedex-container"
          >
            <h3 className="picker__pokedex-name">{section.name}</h3>
            <ol className="picker__pokedex" id={section.slug}>
              {displayEntries.map((entry) => (
                <li
                  key={entry.slug}
                  className="pokedex-entry"
                  data-slug={entry.slug}
                  data-id={entry.pokemon.base_id}
                  data-form-id={entry.pokemon.form_id}
                  title={entry.pokemon.name}
                >
                  <button
                    type="button"
                    className="pokedex-entry__button"
                    onClick={() => onPick(entry.slug)}
                  >
                    <img
                      className="pokedex-entry__thumb"
                      src={getPokemonRenderUrl(
                        entry.pokemon,
                        entry.isGmax,
                      )}
                      alt={entry.pokemon.name}
                      loading="lazy"
                    />
                  </button>
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}
