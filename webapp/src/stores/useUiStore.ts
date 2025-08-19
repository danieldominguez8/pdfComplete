import { create } from 'zustand'

interface UiState {
	commonOnly: boolean
	setCommonOnly: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
	commonOnly: false,
	setCommonOnly: (v) => set({ commonOnly: v }),
}))

