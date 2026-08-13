import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { FeatureFlagId } from "@/core/feature-flags/registry";

export const featureFlagStoreName = "app-feature-flags" as const;

type FeatureFlagOverrides = Partial<Record<FeatureFlagId, boolean>>;

interface FeatureFlagStoreState {
  overrides: FeatureFlagOverrides;
}

interface FeatureFlagStoreAction {
  setOverride: (id: FeatureFlagId, enabled: boolean) => void;
  resetOverride: (id: FeatureFlagId) => void;
  resetAllOverrides: () => void;
}

type FeatureFlagStore = FeatureFlagStoreState & FeatureFlagStoreAction;

export const useFeatureFlagStore = create<FeatureFlagStore>()(
  persist(
    (set) => ({
      overrides: {},
      setOverride: (id, enabled) => {
        set((state) => ({
          overrides: { ...state.overrides, [id]: enabled },
        }));
      },
      resetOverride: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.overrides;
          return { overrides: rest };
        });
      },
      resetAllOverrides: () => {
        set({ overrides: {} });
      },
    }),
    {
      name: featureFlagStoreName,
      storage: createJSONStorage(() => localStorage),
      version: 0,
    }
  )
);
