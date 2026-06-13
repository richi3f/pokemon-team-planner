"use client";

import type { Game } from "@/lib/types";
import type { FilterState } from "@/lib/planner/filters";
import {
  filterLabelOptions,
  toggleFilterValues,
} from "@/lib/planner/filters";
import { capitalize, capitalizeSnakeCase } from "@/lib/utils/string";
import { useState } from "react";

interface FilterPanelProps {
  game: Game;
  gameSlug: string;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterPanel({
  game,
  filters,
  onChange,
  onClose,
}: FilterPanelProps) {
  const options = filterLabelOptions(game);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const patch = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const toggle = (
    key: keyof FilterState,
    value: string,
    checked: boolean,
    allValues: string[],
  ) => {
    const current = filters[key] as string[];
    patch({ [key]: toggleFilterValues(current, value, checked, allValues) });
  };

  return (
    <div className="picker__filters">
      <h3 className="filter__heading">Filters</h3>
      <div className="filter__scrollbox">
        <div className="filter filter_enabled" data-type="name">
          <label className="filter__name" htmlFor="search-bar">
            Name
          </label>
          <input
            id="search-bar"
            className="filter__search-bar"
            type="search"
            placeholder="Enter Pokémon name"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
          />
        </div>

        <FilterDropdown
          id="type"
          label="Type"
          active={activeFilter}
          setActive={setActiveFilter}
          buttonLabel={selectionLabel(filters.type, options.types.length)}
          menuClass="filter__dropdown-menu_3col"
        >
          <FilterCheckbox
            label="Select All"
            value="all"
            checked={filters.type.length === options.types.length}
            onChange={(c) => toggle("type", "all", c, options.types)}
          />
          {options.types.map((t) => (
            <FilterCheckbox
              key={t}
              label={capitalize(t)}
              value={t}
              checked={filters.type.includes(t)}
              onChange={(c) => toggle("type", t, c, options.types)}
            />
          ))}
        </FilterDropdown>

        <FilterDropdown
          id="exclude-type"
          label="Exclude Type"
          active={activeFilter}
          setActive={setActiveFilter}
          buttonLabel={selectionLabel(
            filters.excludeType,
            options.types.length,
            false,
          )}
          menuClass="filter__dropdown-menu_3col"
        >
          {options.types.map((t) => (
            <FilterCheckbox
              key={t}
              label={capitalize(t)}
              value={t}
              checked={filters.excludeType.includes(t)}
              onChange={(c) => toggle("excludeType", t, c, options.types)}
            />
          ))}
        </FilterDropdown>

        <FilterDropdown
          id="tag"
          label="Tag"
          active={activeFilter}
          setActive={setActiveFilter}
          buttonLabel={selectionLabel(filters.tag, 5)}
        >
          <FilterCheckbox
            label="Non-Legendary"
            value="is_nonlegendary"
            checked={filters.tag.includes("is_nonlegendary")}
            onChange={(c) =>
              toggle("tag", "is_nonlegendary", c, [
                "is_nonlegendary",
                "is_sublegendary",
                "is_legendary",
                "is_mythical",
                "is_not_misc_form",
                "is_misc_form",
                "gmax",
              ])
            }
          />
          <FilterCheckbox
            label="Sub-Legendary"
            value="is_sublegendary"
            checked={filters.tag.includes("is_sublegendary")}
            onChange={(c) =>
              toggle("tag", "is_sublegendary", c, filters.tag)
            }
          />
          <FilterCheckbox
            label="Legendary"
            value="is_legendary"
            checked={filters.tag.includes("is_legendary")}
            onChange={(c) => toggle("tag", "is_legendary", c, filters.tag)}
          />
          <FilterCheckbox
            label="Mythical"
            value="is_mythical"
            checked={filters.tag.includes("is_mythical")}
            onChange={(c) => toggle("tag", "is_mythical", c, filters.tag)}
          />
          {game.gen >= 2 && (
            <FilterCheckbox
              label="Misc. Forms"
              value="is_misc_form"
              checked={filters.tag.includes("is_misc_form")}
              onChange={(c) => {
                if (c) {
                  patch({
                    tag: [
                      ...filters.tag.filter((t) => t !== "is_not_misc_form"),
                      "is_misc_form",
                    ],
                  });
                } else {
                  patch({
                    tag: [
                      ...filters.tag.filter((t) => t !== "is_misc_form"),
                      "is_not_misc_form",
                    ],
                  });
                }
              }}
            />
          )}
          {game.gmax && (
            <FilterCheckbox
              label="Gigantamax"
              value="gmax"
              checked={filters.tag.includes("gmax")}
              onChange={(c) => toggle("tag", "gmax", c, filters.tag)}
            />
          )}
        </FilterDropdown>

        {game.hm && game.hm.length > 0 && (
          <FilterDropdown
            id="hm"
            label="Hidden Moves"
            active={activeFilter}
            setActive={setActiveFilter}
            buttonLabel={selectionLabel(filters.hm, game.hm.length, false)}
          >
            {game.hm.map((move) => (
              <FilterCheckbox
                key={move}
                label={capitalizeSnakeCase(move)}
                value={move}
                checked={filters.hm.includes(move)}
                onChange={(c) => toggle("hm", move, c, game.hm!)}
              />
            ))}
          </FilterDropdown>
        )}
      </div>
      <button type="button" className="filter__close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

function selectionLabel(
  selected: string[],
  total: number,
  defaultAll = true,
): string {
  if (selected.length === 0) return defaultAll ? "None Selected" : "None Selected";
  if (selected.length >= total) return "All Selected";
  if (selected.length === 1) return "1 Selected";
  return `${selected.length} Selected`;
}

function FilterDropdown({
  id,
  label,
  active,
  setActive,
  buttonLabel,
  menuClass,
  children,
}: {
  id: string;
  label: string;
  active: string | null;
  setActive: (id: string | null) => void;
  buttonLabel: string;
  menuClass?: string;
  children: React.ReactNode;
}) {
  const isActive = active === id;
  return (
    <div
      className={"filter filter_enabled" + (isActive ? " filter_active" : "")}
      data-type={id}
    >
      <label className="filter__name" htmlFor={`${id}-filter`}>
        {label}
      </label>
      <button
        type="button"
        id={`${id}-filter`}
        className="filter__button"
        onClick={() => setActive(isActive ? null : id)}
      >
        {buttonLabel}
      </button>
      <ol
        className={
          "filter__dropdown-menu" + (menuClass ? " " + menuClass : "")
        }
      >
        {children}
      </ol>
    </div>
  );
}

function FilterCheckbox({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = `filter-${value}`;
  return (
    <li
      className={
        "dropdown-menu-item" + (checked ? " dropdown-menu-item_active" : "")
      }
    >
      <label className="dropdown-menu-item__name" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="dropdown-menu-item__checkbox"
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </li>
  );
}
