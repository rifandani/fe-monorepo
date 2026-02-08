import { MMKV } from 'react-native-mmkv'
import type { StateStorage } from 'zustand/middleware'

export const appStorageId = 'app-storage' as const
export const appStorage = new MMKV({
  id: appStorageId,
  encryptionKey: 'fe-monorepo/expo', // simple inline key for now
})

export const appStateStorage: StateStorage = {
  setItem: (name, value) => {
    return appStorage.set(name, value)
  },
  getItem: (name) => {
    const value = appStorage.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    return appStorage.delete(name)
  },
}
