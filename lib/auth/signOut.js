"use client";

import { useAuthStore } from "@/store/authStore";

/** Clear session and navigate away (use from click handlers). */
export function signOut(router) {
  useAuthStore.getState().logout();
  useAuthStore.persist.clearStorage();
  if (router) {
    router.replace("/");
    router.refresh();
  } else if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}
