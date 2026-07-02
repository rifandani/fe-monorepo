import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const appStorageId = "app-storage" as const;
export const appStorage = new MMKV({
  encryptionKey: "fe-monorepo/expo",
  id: appStorageId,
});
export const appStateStorage: StateStorage = {
  getItem: (name) => {
    const value = appStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => appStorage.delete(name),
  setItem: (name, value) => appStorage.set(name, value),
};
