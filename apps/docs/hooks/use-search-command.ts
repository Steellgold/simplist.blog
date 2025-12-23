import { create } from "zustand";

type SearchCommandState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useSearchCommand = create<SearchCommandState>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (open: boolean) => set({ open }),
}));
