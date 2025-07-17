"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from 'react';

type Language = "fr" | "en" | "nl";

interface MultilingualContextType {
  globalLanguage: Language;
  setGlobalLanguage: (language: Language) => void;
}

// Exporter le contexte pour pouvoir l'utiliser directement
export const MultilingualContext =
  createContext<MultilingualContextType | null>(null);

export function MultilingualProvider({ children }: { children: ReactNode }) {
  const [globalLanguage, setGlobalLanguage] = useState<Language>("fr");

  return (
    <MultilingualContext.Provider value={{ globalLanguage, setGlobalLanguage }}>
      {children}
    </MultilingualContext.Provider>
  );
}

export function useMultilingualContext() {
  const context = useContext(MultilingualContext);
  if (context === null) {
    throw new Error(
      "useMultilingualContext must be used within a MultilingualProvider"
    );
  }
  return context;
}
