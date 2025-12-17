"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  darkMode: boolean;
  autoDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setAutoDarkMode: (auto: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      autoDarkMode: true,
      setDarkMode: (dark) => set({ darkMode: dark }),
      setAutoDarkMode: (auto) => set({ autoDarkMode: auto }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: "ui-storage",
    }
  )
);

