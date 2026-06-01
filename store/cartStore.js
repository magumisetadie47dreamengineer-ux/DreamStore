"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const stock = product.stock ?? 0;
        if (stock < 1) {
          return { ok: false, message: "This item is out of stock" };
        }

        const items = get().items;
        const existing = items.find((i) => i.productId === product._id);
        const nextQty = (existing?.quantity ?? 0) + quantity;

        if (nextQty > stock) {
          return {
            ok: false,
            message: `Only ${stock} available in stock`,
          };
        }

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product._id
                ? { ...i, quantity: nextQty }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock,
                quantity,
              },
            ],
          });
        }

        return { ok: true };
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return { ok: true };
        }

        const item = get().items.find((i) => i.productId === productId);
        const maxStock = item?.stock ?? 99;
        if (item && quantity > maxStock) {
          return {
            ok: false,
            message: `Only ${maxStock} available`,
          };
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
        return { ok: true };
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotal: () => get().getSubtotal(),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
