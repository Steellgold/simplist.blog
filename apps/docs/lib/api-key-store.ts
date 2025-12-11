import { create } from 'zustand'

interface ApiKeyStore {
  apiKey: string | null
  setApiKey: (key: string | null) => void
  clearApiKey: () => void
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),
  clearApiKey: () => set({ apiKey: null })
}))
