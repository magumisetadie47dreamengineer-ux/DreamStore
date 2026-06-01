"use client";

import { create } from "zustand";

export const useUiStore = create((set) => ({
  cartDrawerOpen: false,
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  toggleCartDrawer: () =>
    set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),

  toast: null,
  showToast: (message) => {
    set({ toast: message });
    setTimeout(() => set({ toast: null }), 3200);
  },
}));
