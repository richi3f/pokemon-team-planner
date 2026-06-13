"use client";

import { createContext, useContext } from "react";
import type { GameDataStore } from "@/lib/data/load-game-data";

const GameDataContext = createContext<GameDataStore | null>(null);

export function GameDataProvider({
  store,
  children,
}: {
  store: GameDataStore;
  children: React.ReactNode;
}) {
  return (
    <GameDataContext.Provider value={store}>{children}</GameDataContext.Provider>
  );
}

export function useGameData(): GameDataStore {
  const store = useContext(GameDataContext);
  if (!store) {
    throw new Error("useGameData must be used within GameDataProvider");
  }
  return store;
}
