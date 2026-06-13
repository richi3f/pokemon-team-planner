"use client";

import type { Game } from "@/lib/types";
import type { TeamSlotState } from "@/lib/planner/team-state";
import type { TypeChart } from "@/lib/types";
import { capitalize } from "@/lib/utils/string";
import {
  EMPTY_SLOT_IMAGE,
  getSlotImageUrl,
  isGmaxSlug,
} from "@/lib/planner/slot-visual";
import { findPokemonEntry } from "@/lib/planner/dex-list";
import { useGameData } from "@/contexts/GameDataContext";
import { getPokemonType } from "@/lib/utils/pokemon";
import { TeraPicker } from "@/components/planner/TeraPicker";

interface TeamSlotProps {
  slot: TeamSlotState;
  index: number;
  game: Game;
  typeChart: TypeChart;
  teraOpen: boolean;
  onRemove: () => void;
  onToggleFemale: () => void;
  onToggleShiny: () => void;
  onTeraToggle: () => void;
  onTeraSelect: (type: string) => void;
  onTeraReset: () => void;
}

export function TeamSlot({
  slot,
  index,
  game,
  typeChart,
  teraOpen,
  onRemove,
  onToggleFemale,
  onToggleShiny,
  onTeraToggle,
  onTeraSelect,
  onTeraReset,
}: TeamSlotProps) {
  const { pokemon } = useGameData();
  const populated = Boolean(slot.slug);
  const base = slot.slug ? findPokemonEntry(slot.slug, pokemon) : undefined;
  const gmax = isGmaxSlug(slot.slug);
  const types = base && populated
    ? slot.tera
      ? [slot.tera]
      : getPokemonType(base, game)
    : ["", ""];

  const imgSrc =
    base && populated
      ? getSlotImageUrl(base, {
          gmax,
          female: slot.female,
          shiny: slot.shiny,
        })
      : EMPTY_SLOT_IMAGE;

  const formLabel = gmax
    ? "Gigantamax"
    : base?.form_name
      ? String(base.form_name)
      : null;

  const showGender =
    populated && base && !gmax && base.gender.length === 2;
  const showShiny =
    populated &&
    base &&
    slot.slug !== "floette-eternal" &&
    slot.slug !== "floette-mega";
  const showTera =
    populated && game.tera && !slot.slug.includes("terapagos");

  const typeKey = types[0] ?? "";
  const typeKey2 = types[types.length - 1] ?? "";

  return (
    <li
      className={
        "slot " + (populated ? "slot_populated" : "slot_empty")
      }
      data-slug={slot.slug}
      data-type={types.join(",")}
      data-tera={slot.tera}
    >
      <div
        className={
          "slot__remove-button slot__bg-type-1" +
          (populated ? ` slot__bg-type-1_${slot.tera || typeKey}` : "")
        }
        onClick={populated ? onRemove : undefined}
        role={populated ? "button" : undefined}
        tabIndex={populated ? 0 : undefined}
        onKeyDown={
          populated
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onRemove();
              }
            : undefined
        }
      >
        <figure
          className={
            "slot__bg-type-2" +
            (populated
              ? ` slot__bg-type-2_${slot.tera || typeKey2}`
              : "")
          }
        >
          <img
            className={
              "slot__pokemon-render" +
              (gmax ? " slot__pokemon-render_gmax" : "")
            }
            src={imgSrc}
            alt={base?.name ?? ""}
          />
        </figure>
      </div>
      <div
        className={
          "slot__info" +
          (populated ? ` slot__info_${slot.tera || typeKey}` : "")
        }
        onClick={populated ? onRemove : undefined}
        role={populated ? "button" : undefined}
      >
        <div className="slot__name-container">
          <span className="slot__name">{base?.name ?? "???"}</span>
          <span
            className={
              "slot__form" + (formLabel ? "" : " slot__form_none")
            }
          >
            {formLabel ?? ""}
          </span>
        </div>
        <ol className="slot__type-container">
          <li className={"slot__type" + (types[0] ? ` slot__type_${types[0]}` : "")}>
            {types[0] ? capitalize(types[0]) : ""}
          </li>
          <li
            className={
              "slot__type" + (types[1] ? ` slot__type_${types[1]}` : "")
            }
          >
            {types[1] && types[1] !== types[0]
              ? capitalize(types[1])
              : ""}
          </li>
        </ol>
      </div>
      <div className="slot__toggle-container">
        {showGender && (
          <button
            type="button"
            className={
              "slot__toggle slot__toggle_female" +
              (slot.female ? "" : " slot__toggle_male")
            }
            title="Toggle Gender"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFemale();
            }}
            dangerouslySetInnerHTML={{
              __html: slot.female ? "&female;" : "&male;",
            }}
          />
        )}
        {!showGender && (
          <button
            type="button"
            className="slot__toggle slot__toggle_hidden slot__toggle_female"
            title="Toggle Gender"
            dangerouslySetInnerHTML={{ __html: "&female;" }}
          />
        )}
        {showShiny && (
          <button
            type="button"
            className={
              "slot__toggle " +
              (slot.shiny ? "slot__toggle_shiny" : "slot__toggle_regular")
            }
            title="Toggle Shiny"
            onClick={(e) => {
              e.stopPropagation();
              onToggleShiny();
            }}
          >
            ✨
          </button>
        )}
        {!showShiny && (
          <button
            type="button"
            className="slot__toggle slot__toggle_hidden slot__toggle_regular"
            title="Toggle Shiny"
          >
            ✨
          </button>
        )}
        {showTera && (
          <>
            <button
              type="button"
              className={
                "slot__toggle slot__toggle_tera " +
                (slot.tera
                  ? `slot__toggle_tera_picked slot__toggle_tera_${slot.tera}`
                  : "slot__toggle_tera_none")
              }
              title={slot.tera ? "Reset Type" : "Terastallize"}
              onClick={(e) => {
                e.stopPropagation();
                if (slot.tera) {
                  onTeraReset();
                } else {
                  onTeraToggle();
                }
              }}
            >
              🔯
            </button>
            {teraOpen && !slot.tera && (
              <TeraPicker
                typeChart={typeChart}
                onSelect={onTeraSelect}
              />
            )}
          </>
        )}
      </div>
    </li>
  );
}
