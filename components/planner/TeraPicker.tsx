"use client";

import type { TypeChart } from "@/lib/types";
import { capitalize } from "@/lib/utils/string";

interface TeraPickerProps {
  typeChart: TypeChart;
  onSelect: (type: string) => void;
}

export function TeraPicker({ typeChart, onSelect }: TeraPickerProps) {
  return (
    <ol className="tera-picker tera-picker_active">
      {Object.keys(typeChart).map((type) => (
        <li key={type}>
          <button
            type="button"
            className={`tera-picker__button tera-picker__button_${type}`}
            data-type={type}
            title={capitalize(type)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(type);
            }}
          >
            {capitalize(type)}
          </button>
        </li>
      ))}
    </ol>
  );
}
